# SmartView — AI & Machine Learning Data Analytics Platform

[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![AWS DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-232F3E?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/dynamodb/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white)](https://openai.com/)

SmartView is an enterprise-grade AI and Machine Learning prototype developed for automated data analytics, pattern recognition, and executive business intelligence. Users can register, log in with password security checks, upload CSV or Excel datasets, and instantly receive automated data cleaning, exploratory data analysis, machine learning insights, and executive PDF reports without writing any code.

---

## 🌟 Core Capabilities

### 1. 📁 Automated Data Ingestion & Preprocessing
- Supports drag-and-drop ingestion of **CSV**, **XLSX**, and **XLS** files.
- Automatically handles missing values (imputation via mean/mode), removes duplicate records, normalizes data types, and computes completeness indices.
- Bundled with a realistic **850-record Industrial IoT Telemetry Dataset** for machine health and failure risk detection.

### 2. 📊 Smart Dashboard & Telemetry
- Interactive summary KPI cards with trend indicators.
- Automated distribution visualizations: bar charts, area distributions, correlation matrices, and pie breakdowns.
- Deep statistical profiles across all numerical features: min, max, mean, median, standard deviation, Q1, and Q3 quartiles.

### 3. 🧠 Machine Learning Intelligence Engine
- **Anomaly Detection**: Multidimensional Z-Score and Isolation Forest algorithms flagging high-risk statistical outliers.
- **Customer & Asset Clustering**: K-Means clustering algorithm segmenting records into natural behavioral cohorts.
- **Trend Forecasting**: Linear regression and moving average trendlines measuring slope and direction.

### 4. ✨ OpenAI-Powered Executive Insights (`/ai-insights`)
- Integrates with the **OpenAI API** (`gpt-4o-mini`) to synthesize dataset telemetry into C-suite recommendations.
- **Company Strategic Health Score** (rated 0–100).
- **Categorized Action Plans**: Concrete initiatives across *Revenue Optimization*, *Risk & Fraud Mitigation*, *Operational Efficiency*, and *Customer Retention* with estimated ROI.
- **30-Day and 90-Day KPI Forecast Milestones**.

### 5. 📄 Executive Multi-Page PDF Reports (`/reports`)
- One-click **Download PDF Report** exporting clean, high-resolution vector PDF reports.
- Includes corporate headers, dataset telemetry, rendered charts, statistical profile tables, risk audit tables, and OpenAI recommendations.

### 6. 🕒 Persistent Dataset History & Archive (`/history`)
- Dedicated archive storing historical datasets uploaded past months or earlier.
- Pre-populated with historical benchmarks: Today, 1 month ago (`Q4_Revenue_Audit_2024.csv`), and 2 months ago (`Supply_Chain_Logistics_2024.xlsx`).
- 1-click **Set as Active**, quick preview modals, and CSV export.

---

## ☁️ AWS DynamoDB Architecture

- **Target Table**: `arn:aws:dynamodb:us-east-1:842544789430:table/SmartView_Core`
- **Region**: `us-east-1`
- **Single-Table Design**:
  - `PK = USER#<username>` / `SK = PROFILE` &rarr; User accounts, security credentials, and registration timestamps.
  - `PK = USER#<userId>` / `SK = DATASET#<datasetId>` &rarr; Isolated user dataset telemetry, ML clusters, and anomaly tables.
- **Dual-Mode Sync**: Connects directly to AWS when IAM keys are configured; automatically falls back to an exact-schema local storage mirror when running offline.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/gaurav443201/SMARTVIEW.git
cd SMARTVIEW

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
# AWS DynamoDB Table
VITE_AWS_DYNAMODB_TABLE_ARN=arn:aws:dynamodb:us-east-1:842544789430:table/SmartView_Core
VITE_AWS_REGION=us-east-1
VITE_DYNAMODB_TABLE_NAME=SmartView_Core

# AWS IAM User Credentials (Optional for live cloud sync)
VITE_AWS_ACCESS_KEY_ID=
VITE_AWS_SECRET_ACCESS_KEY=

# OpenAI API Key
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

---

## 🔒 Security & Privacy

- Passwords require strict security checks (8+ characters, uppercase letter, number, special character).
- All datasets are partitioned strictly per user account.
- `.env` files containing cryptographic secret keys are ignored in `.gitignore`.

---

## 📜 License

MIT License. Developed for enterprise data analytics and machine learning demonstration.
