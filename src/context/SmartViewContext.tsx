import React, { createContext, useCallback, useContext, useEffect, useReducer } from "react";
import { createDefaultUserDataset, createSampleHistoryDatasets } from "@/utils/sampleDataset";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface DatasetColumn {
  name: string;
  type: "numeric" | "categorical" | "datetime" | "boolean" | "unknown";
  nullCount: number;
  uniqueCount: number;
  sampleValues: (string | number | null)[];
}

export interface DatasetStats {
  rowCount: number;
  colCount: number;
  nullCells: number;
  duplicateRows: number;
  completeness: number; // 0-100
  columns: DatasetColumn[];
  numericStats: Record<
    string,
    {
      min: number;
      max: number;
      mean: number;
      median: number;
      std: number;
      q1: number;
      q3: number;
    }
  >;
  correlationMatrix: Record<string, Record<string, number>>;
}

export interface AnomalyResult {
  rowIndex: number;
  column: string;
  value: number;
  zScore: number;
  isAnomaly: boolean;
}

export interface ClusterResult {
  rowIndex: number;
  cluster: number;
  distance: number;
}

export interface TrendResult {
  column: string;
  direction: "upward" | "downward" | "stable";
  slope: number;
  trendLine: number[];
}

export interface KPI {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "stable";
  unit?: string;
}

export interface Insight {
  type: "finding" | "recommendation" | "warning" | "anomaly";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  affectedColumn?: string;
}

export interface ChartConfig {
  id: string;
  type: "bar" | "line" | "pie" | "scatter" | "area" | "heatmap" | "histogram";
  title: string;
  description: string;
  xColumn?: string;
  yColumn?: string;
  data: unknown[];
  options?: Record<string, unknown>;
}

export interface Dataset {
  id: string;
  name: string;
  uploadedAt: string;
  rawData: Record<string, unknown>[];
  cleanedData: Record<string, unknown>[];
  stats: DatasetStats;
  anomalies: AnomalyResult[];
  clusters: ClusterResult[];
  trends: TrendResult[];
  kpis: KPI[];
  insights: Insight[];
  charts: ChartConfig[];
  preprocessingLog: string[];
  status: "uploading" | "preprocessing" | "analyzing" | "ready" | "error";
}

export interface SmartViewState {
  user: User | null;
  isAuthenticated: boolean;
  currentDataset: Dataset | null;
  datasetHistory: Dataset[];
  analysisProgress: number; // 0-100
  isAnalyzing: boolean;
  activeView: "dashboard" | "upload" | "preprocessing" | "eda" | "visualization" | "aiml" | "insights" | "reports" | "history";
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_DATASET"; payload: Dataset }
  | { type: "UPDATE_DATASET"; payload: Partial<Dataset> }
  | { type: "SET_ANALYSIS_PROGRESS"; payload: number }
  | { type: "SET_IS_ANALYZING"; payload: boolean }
  | { type: "SET_ACTIVE_VIEW"; payload: SmartViewState["activeView"] }
  | { type: "ADD_TO_HISTORY"; payload: Dataset }
  | { type: "DELETE_FROM_HISTORY"; payload: string }
  | { type: "LOAD_DATASET_FROM_HISTORY"; payload: string }
  | { type: "LOAD_FROM_STORAGE"; payload: Partial<SmartViewState> };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: SmartViewState, action: Action): SmartViewState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload, isAuthenticated: true };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        currentDataset: null,
        datasetHistory: [],
        analysisProgress: 0,
        isAnalyzing: false,
      };
    case "SET_DATASET":
      return { ...state, currentDataset: action.payload };
    case "UPDATE_DATASET":
      if (!state.currentDataset) return state;
      return { ...state, currentDataset: { ...state.currentDataset, ...action.payload } };
    case "SET_ANALYSIS_PROGRESS":
      return { ...state, analysisProgress: action.payload };
    case "SET_IS_ANALYZING":
      return { ...state, isAnalyzing: action.payload };
    case "SET_ACTIVE_VIEW":
      return { ...state, activeView: action.payload };
    case "ADD_TO_HISTORY": {
      const filtered = state.datasetHistory.filter((d) => d.id !== action.payload.id);
      return {
        ...state,
        datasetHistory: [action.payload, ...filtered],
      };
    }
    case "DELETE_FROM_HISTORY":
      return {
        ...state,
        datasetHistory: state.datasetHistory.filter((d) => d.id !== action.payload),
      };
    case "LOAD_DATASET_FROM_HISTORY": {
      const selected = state.datasetHistory.find((d) => d.id === action.payload);
      if (selected) {
        return {
          ...state,
          currentDataset: selected,
        };
      }
      return state;
    }
    case "LOAD_FROM_STORAGE":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

const initialState: SmartViewState = {
  user: null,
  isAuthenticated: false,
  currentDataset: null,
  datasetHistory: [],
  analysisProgress: 0,
  isAnalyzing: false,
  activeView: "dashboard",
};

// ─── Context ──────────────────────────────────────────────────────────────────

export interface SmartViewContextType extends SmartViewState {
  login: (user: User) => void;
  logout: () => void;
  setDataset: (dataset: Dataset) => void;
  updateDataset: (patch: Partial<Dataset>) => void;
  addToHistory: (dataset: Dataset) => void;
  loadDatasetFromHistory: (datasetId: string) => void;
  deleteFromHistory: (datasetId: string) => void;
  setAnalysisProgress: (progress: number) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setActiveView: (view: SmartViewState["activeView"]) => void;
}

const SmartViewContext = createContext<SmartViewContextType | undefined>(undefined);

export function SmartViewProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Rehydrate active user from localStorage (or fallback to enterprise admin session)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("smartview_user");
      if (storedUser) {
        const user = JSON.parse(storedUser) as User;
        dispatch({ type: "LOGIN", payload: user });
      } else {
        const defaultUser: User = {
          id: "enterprise_admin",
          username: "admin",
          name: "Admin User",
          email: "admin@smartview.enterprise",
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: "LOGIN", payload: defaultUser });
      }
    } catch {
      // ignore
    }
  }, []);

  // Isolate and load datasets specifically for the authenticated user (matches DynamoDB PK = USER#id)
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("smartview_user", JSON.stringify(state.user));
      try {
        const userDatasetKey = `smartview_dataset_${state.user.id}`;
        const userHistoryKey = `smartview_history_${state.user.id}`;

        const storedDs = localStorage.getItem(userDatasetKey);
        const storedHist = localStorage.getItem(userHistoryKey);

        if (storedDs) {
          const ds = JSON.parse(storedDs);
          dispatch({ type: "SET_DATASET", payload: ds });

          if (storedHist) {
            dispatch({
              type: "LOAD_FROM_STORAGE",
              payload: { datasetHistory: JSON.parse(storedHist) },
            });
          } else {
            createSampleHistoryDatasets(state.user.id, ds).then((historyList) => {
              dispatch({
                type: "LOAD_FROM_STORAGE",
                payload: { datasetHistory: historyList },
              });
              localStorage.setItem(userHistoryKey, JSON.stringify(historyList));
            });
          }
        } else {
          // Initialize user's default secure dataset and sample history
          createDefaultUserDataset(state.user.id, state.user.name || state.user.username).then((ds) => {
            dispatch({ type: "SET_DATASET", payload: ds });
            localStorage.setItem(userDatasetKey, JSON.stringify(ds));

            createSampleHistoryDatasets(state.user!.id, ds).then((historyList) => {
              dispatch({
                type: "LOAD_FROM_STORAGE",
                payload: { datasetHistory: historyList },
              });
              localStorage.setItem(userHistoryKey, JSON.stringify(historyList));
            });
          });
        }
      } catch (err) {
        console.error("Error loading user dataset:", err);
      }
    } else {
      localStorage.removeItem("smartview_user");
    }
  }, [state.user?.id]);

  // Persist current dataset strictly under this user's isolated partition
  useEffect(() => {
    if (state.user && state.currentDataset) {
      localStorage.setItem(`smartview_dataset_${state.user.id}`, JSON.stringify(state.currentDataset));
    }
  }, [state.user?.id, state.currentDataset]);

  // Persist history strictly under this user's isolated partition
  useEffect(() => {
    if (state.user && state.datasetHistory.length > 0) {
      localStorage.setItem(`smartview_history_${state.user.id}`, JSON.stringify(state.datasetHistory));
    }
  }, [state.user?.id, state.datasetHistory]);

  const login = useCallback((user: User) => dispatch({ type: "LOGIN", payload: user }), []);
  const logout = useCallback(() => dispatch({ type: "LOGOUT" }), []);
  const setDataset = useCallback((dataset: Dataset) => {
    dispatch({ type: "SET_DATASET", payload: dataset });
    dispatch({ type: "ADD_TO_HISTORY", payload: dataset });
  }, []);
  const updateDataset = useCallback((patch: Partial<Dataset>) => dispatch({ type: "UPDATE_DATASET", payload: patch }), []);
  const addToHistory = useCallback((dataset: Dataset) => dispatch({ type: "ADD_TO_HISTORY", payload: dataset }), []);
  const loadDatasetFromHistory = useCallback((datasetId: string) => dispatch({ type: "LOAD_DATASET_FROM_HISTORY", payload: datasetId }), []);
  const deleteFromHistory = useCallback((datasetId: string) => dispatch({ type: "DELETE_FROM_HISTORY", payload: datasetId }), []);
  const setAnalysisProgress = useCallback((progress: number) => dispatch({ type: "SET_ANALYSIS_PROGRESS", payload: progress }), []);
  const setIsAnalyzing = useCallback((isAnalyzing: boolean) => dispatch({ type: "SET_IS_ANALYZING", payload: isAnalyzing }), []);
  const setActiveView = useCallback((view: SmartViewState["activeView"]) => dispatch({ type: "SET_ACTIVE_VIEW", payload: view }), []);

  return (
    <SmartViewContext.Provider
      value={{
        ...state,
        login,
        logout,
        setDataset,
        updateDataset,
        addToHistory,
        loadDatasetFromHistory,
        deleteFromHistory,
        setAnalysisProgress,
        setIsAnalyzing,
        setActiveView,
      }}
    >
      {children}
    </SmartViewContext.Provider>
  );
}

export function useSmartView() {
  const ctx = useContext(SmartViewContext);
  if (!ctx) throw new Error("useSmartView must be used inside SmartViewProvider");
  return ctx;
}
