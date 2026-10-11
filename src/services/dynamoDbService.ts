import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { Dataset, User } from "../context/SmartViewContext";

/**
 * AWS DynamoDB Service Configuration
 * Target Table: arn:aws:dynamodb:us-east-1:842544789430:table/SmartView_Core
 * Partition Key: PK (String, e.g. "USER#<username>")
 * Sort Key: SK (String, e.g. "PROFILE", "DATASET#<id>", "HISTORY")
 */

export function getAwsCredentials() {
  const tableArn =
    import.meta.env.VITE_AWS_DYNAMODB_TABLE_ARN ||
    localStorage.getItem("smartview_aws_table_arn") ||
    "arn:aws:dynamodb:us-east-1:842544789430:table/SmartView_Core";

  // Parse ARN: arn:aws:dynamodb:<region>:<account>:table/<tableName>
  const arnMatch = tableArn.match(/^arn:aws:dynamodb:([^:]+):([^:]+):table\/(.+)$/);
  const arnRegion = arnMatch ? arnMatch[1] : undefined;
  const arnTable = arnMatch ? arnMatch[3] : undefined;

  const accessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID || localStorage.getItem("smartview_aws_access_key") || "";
  const secretKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || localStorage.getItem("smartview_aws_secret_key") || "";
  const region = import.meta.env.VITE_AWS_REGION || arnRegion || localStorage.getItem("smartview_aws_region") || "us-east-1";
  const tableName = import.meta.env.VITE_DYNAMODB_TABLE_NAME || arnTable || localStorage.getItem("smartview_aws_table") || "SmartView_Core";

  return { accessKey, secretKey, region, tableName, tableArn };
}

let docClient: DynamoDBDocumentClient | null = null;

export function initDynamoDbClient(): boolean {
  const { accessKey, secretKey, region, tableName } = getAwsCredentials();
  if (accessKey && secretKey) {
    try {
      const rawClient = new DynamoDBClient({
        region,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });
      docClient = DynamoDBDocumentClient.from(rawClient, {
        marshallOptions: { removeUndefinedValues: true },
      });
      console.log(`[SmartView] Initialized AWS DynamoDB client: ${tableName} (${region})`);
      return true;
    } catch (err) {
      console.error("[SmartView] Failed to initialize DynamoDB client:", err);
      docClient = null;
      return false;
    }
  }
  docClient = null;
  return false;
}

// Initial attempt
initDynamoDbClient();

export function isDynamoDbConfigured(): boolean {
  const { accessKey, secretKey } = getAwsCredentials();
  return Boolean(accessKey && secretKey);
}

export function saveAwsCredentials(accessKey: string, secretKey: string, region = "us-east-1", tableName = "SmartView_Core") {
  localStorage.setItem("smartview_aws_access_key", accessKey.trim());
  localStorage.setItem("smartview_aws_secret_key", secretKey.trim());
  localStorage.setItem("smartview_aws_region", region.trim());
  localStorage.setItem("smartview_aws_table", tableName.trim());
  return initDynamoDbClient();
}

export async function testDynamoDbConnection(): Promise<{ success: boolean; message: string }> {
  initDynamoDbClient();
  if (!docClient) {
    return {
      success: false,
      message: "AWS Credentials are missing. Please enter your Access Key ID and Secret Access Key.",
    };
  }

  const { tableName } = getAwsCredentials();
  try {
    // Attempt a lightweight test query
    await docClient.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": "TEST#PING" },
        Limit: 1,
      })
    );
    return { success: true, message: `Connected to DynamoDB table "${tableName}" successfully!` };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to connect to table "${tableName}": ${errorMsg}`,
    };
  }
}

const TABLE_NAME = "SmartView_Core";

// ─── User Profile Operations ──────────────────────────────────────────────────

export async function saveUserToDynamoDB(user: User, passwordPlain: string): Promise<boolean> {
  const pk = `USER#${user.username.toLowerCase()}`;
  const sk = "PROFILE";

  if (docClient) {
    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: pk,
            SK: sk,
            userId: user.id,
            username: user.username,
            name: user.name,
            email: user.email.toLowerCase(),
            passwordHash: passwordPlain, // In prod, hash with bcrypt/argon2
            createdAt: user.createdAt,
            type: "USER_PROFILE",
          },
        })
      );
      return true;
    } catch (err) {
      console.error("[DynamoDB] Error saving user profile:", err);
    }
  }

  // Fallback / mirror to local storage
  const users: User[] = JSON.parse(localStorage.getItem("smartview_users") ?? "[]");
  if (!users.some((u) => u.username === user.username)) {
    users.push(user);
    localStorage.setItem("smartview_users", JSON.stringify(users));
  }
  localStorage.setItem(`smartview_pw_${user.id}`, passwordPlain);
  localStorage.setItem(`smartview_pw_${user.username.toLowerCase()}`, passwordPlain);
  localStorage.setItem(`smartview_pw_${user.email.toLowerCase()}`, passwordPlain);
  return true;
}

export async function getUserFromDynamoDB(
  usernameOrEmail: string
): Promise<{ user: User; passwordHash: string } | null> {
  const clean = usernameOrEmail.trim().toLowerCase();

  if (docClient) {
    try {
      // 1. Try direct PK lookup by username
      const getRes = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${clean}`,
            SK: "PROFILE",
          },
        })
      );

      if (getRes.Item) {
        return {
          user: {
            id: getRes.Item.userId,
            username: getRes.Item.username,
            name: getRes.Item.name,
            email: getRes.Item.email,
            createdAt: getRes.Item.createdAt,
          },
          passwordHash: getRes.Item.passwordHash,
        };
      }

      // 2. Scan/Query fallback if user entered email instead of username
      const queryRes = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "EmailIndex", // Optional GSI if configured
          KeyConditionExpression: "email = :email",
          ExpressionAttributeValues: { ":email": clean },
        })
      );
      if (queryRes.Items && queryRes.Items.length > 0) {
        const item = queryRes.Items[0];
        return {
          user: {
            id: item.userId,
            username: item.username,
            name: item.name,
            email: item.email,
            createdAt: item.createdAt,
          },
          passwordHash: item.passwordHash,
        };
      }
    } catch (err) {
      console.warn("[DynamoDB] Cloud lookup fallback to local storage:", err);
    }
  }

  // Fallback to local storage
  const users: User[] = JSON.parse(localStorage.getItem("smartview_users") ?? "[]");
  const found = users.find(
    (u) =>
      u.username?.toLowerCase() === clean ||
      u.email?.toLowerCase() === clean
  );

  if (found) {
    const pw =
      localStorage.getItem(`smartview_pw_${found.id}`) ||
      localStorage.getItem(`smartview_pw_${found.username.toLowerCase()}`) ||
      localStorage.getItem(`smartview_pw_${found.email.toLowerCase()}`) ||
      "";
    return { user: found, passwordHash: pw };
  }

  return null;
}

// ─── Dataset Operations (Per-User Partition Isolation) ────────────────────────

export async function saveDatasetToDynamoDB(userId: string, dataset: Dataset): Promise<boolean> {
  const pk = `USER#${userId}`;
  const sk = `DATASET#${dataset.id}`;

  if (docClient) {
    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: pk,
            SK: sk,
            userId,
            datasetId: dataset.id,
            name: dataset.name,
            uploadedAt: dataset.uploadedAt,
            stats: dataset.stats,
            anomalies: dataset.anomalies,
            clusters: dataset.clusters,
            trends: dataset.trends,
            kpis: dataset.kpis,
            insights: dataset.insights,
            charts: dataset.charts,
            preprocessingLog: dataset.preprocessingLog,
            status: dataset.status,
            type: "USER_DATASET",
          },
        })
      );
    } catch (err) {
      console.error("[DynamoDB] Error saving dataset to AWS:", err);
    }
  }

  // Mirror to local user partition
  localStorage.setItem(`smartview_dataset_${userId}`, JSON.stringify(dataset));
  return true;
}

export async function getDatasetFromDynamoDB(userId: string): Promise<Dataset | null> {
  if (docClient) {
    try {
      const res = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
          ExpressionAttributeValues: {
            ":pk": `USER#${userId}`,
            ":skPrefix": "DATASET#",
          },
          Limit: 1,
        })
      );

      if (res.Items && res.Items.length > 0) {
        return res.Items[0] as unknown as Dataset;
      }
    } catch (err) {
      console.warn("[DynamoDB] Query error, falling back to local partition:", err);
    }
  }

  const stored = localStorage.getItem(`smartview_dataset_${userId}`);
  return stored ? JSON.parse(stored) : null;
}
