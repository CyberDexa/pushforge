"use client";

import { createContext, useContext, useReducer, useEffect, useRef, useCallback, type ReactNode, type Dispatch } from "react";
import { useSession } from "next-auth/react";
import type { Product, GeneratedContent, AppView, AppState, Template, Campaign, BrandVoice } from "./types";

const STORAGE_KEY = "pushforge_state";

const initialState: AppState = {
  products: [],
  generatedContent: [],
  currentView: "dashboard",
  apiKey: "",
  aiProvider: "openai",
  templates: [],
  campaigns: [],
  brandVoice: {
    personality: "",
    writingSamples: [],
    doNot: [],
    includeAlways: [],
    companyName: "",
  },
};

type Action =
  | { type: "SET_VIEW"; view: AppView }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "UPDATE_PRODUCT"; product: Product }
  | { type: "DELETE_PRODUCT"; id: string }
  | { type: "ADD_CONTENT"; content: GeneratedContent[] }
  | { type: "MARK_COPIED"; id: string }
  | { type: "DELETE_CONTENT"; id: string }
  | { type: "UPDATE_CONTENT"; content: GeneratedContent }
  | { type: "SET_CONTENT_STATUS"; id: string; status: "draft" | "scheduled" | "posted" }
  | { type: "SCHEDULE_CONTENT"; id: string; scheduledFor: string }
  | { type: "SET_API_KEY"; key: string }
  | { type: "SET_AI_PROVIDER"; provider: "openai" | "anthropic" }
  | { type: "ADD_TEMPLATE"; template: Template }
  | { type: "UPDATE_TEMPLATE"; template: Template }
  | { type: "DELETE_TEMPLATE"; id: string }
  | { type: "ADD_CAMPAIGN"; campaign: Campaign }
  | { type: "UPDATE_CAMPAIGN"; campaign: Campaign }
  | { type: "DELETE_CAMPAIGN"; id: string }
  | { type: "SET_BRAND_VOICE"; brandVoice: BrandVoice }
  | { type: "LOAD_STATE"; state: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, currentView: action.view };
    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.product] };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.product.id ? action.product : p
        ),
      };
    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.id),
      };
    case "ADD_CONTENT":
      return {
        ...state,
        generatedContent: [...action.content, ...state.generatedContent],
      };
    case "MARK_COPIED":
      return {
        ...state,
        generatedContent: state.generatedContent.map((c) =>
          c.id === action.id ? { ...c, copied: true } : c
        ),
      };
    case "DELETE_CONTENT":
      return {
        ...state,
        generatedContent: state.generatedContent.filter((c) => c.id !== action.id),
      };
    case "UPDATE_CONTENT":
      return {
        ...state,
        generatedContent: state.generatedContent.map((c) =>
          c.id === action.content.id ? action.content : c
        ),
      };
    case "SET_CONTENT_STATUS":
      return {
        ...state,
        generatedContent: state.generatedContent.map((c) =>
          c.id === action.id ? { ...c, status: action.status } : c
        ),
      };
    case "SCHEDULE_CONTENT":
      return {
        ...state,
        generatedContent: state.generatedContent.map((c) =>
          c.id === action.id
            ? { ...c, scheduledFor: action.scheduledFor, status: "scheduled" as const }
            : c
        ),
      };
    case "SET_API_KEY":
      return { ...state, apiKey: action.key };
    case "SET_AI_PROVIDER":
      return { ...state, aiProvider: action.provider };
    case "ADD_TEMPLATE":
      return { ...state, templates: [...state.templates, action.template] };
    case "UPDATE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.map((t) =>
          t.id === action.template.id ? action.template : t
        ),
      };
    case "DELETE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.filter((t) => t.id !== action.id),
      };
    case "ADD_CAMPAIGN":
      return { ...state, campaigns: [...state.campaigns, action.campaign] };
    case "UPDATE_CAMPAIGN":
      return {
        ...state,
        campaigns: state.campaigns.map((c) =>
          c.id === action.campaign.id ? action.campaign : c
        ),
      };
    case "DELETE_CAMPAIGN":
      return {
        ...state,
        campaigns: state.campaigns.filter((c) => c.id !== action.id),
      };
    case "SET_BRAND_VOICE":
      return { ...state, brandVoice: action.brandVoice };
    case "LOAD_STATE":
      return { ...action.state };
    default:
      return state;
  }
}

/** Extract persistable data (omit transient UI state like currentView) */
function toPersistable(state: AppState) {
  const { currentView, ...data } = state;
  void currentView;
  return data;
}

const StoreContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
}>({ state: initialState, dispatch: () => {} });

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const dbLoaded = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSync = useRef(false);

  // Load data on mount / auth change
  useEffect(() => {
    if (isAuthenticated && !dbLoaded.current) {
      // Authenticated → load from Neon
      fetch("/api/data")
        .then((r) => r.json())
        .then((data) => {
          if (data && !data.error && Object.keys(data).length > 0) {
            skipNextSync.current = true;
            dispatch({ type: "LOAD_STATE", state: { ...initialState, ...data } });
          } else {
            // DB empty — push localStorage data to DB (migration)
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              const parsed = JSON.parse(saved);
              skipNextSync.current = true;
              dispatch({ type: "LOAD_STATE", state: { ...initialState, ...parsed } });
            }
          }
          dbLoaded.current = true;
        })
        .catch(() => {
          // Fallback to localStorage
          loadFromLocalStorage();
        });
    } else if (status !== "loading") {
      // Not authenticated → localStorage
      loadFromLocalStorage();
    }

    function loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          dispatch({ type: "LOAD_STATE", state: { ...initialState, ...parsed } });
        }
      } catch {
        // ignore
      }
    }
  }, [isAuthenticated, status]);

  // Persist on state change (debounced)
  const saveState = useCallback(() => {
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    const data = toPersistable(state);

    // Always save to localStorage as cache
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }

    // If authenticated, also sync to Neon
    if (isAuthenticated) {
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        fetch("/api/data", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(() => {
          // silent fail — localStorage is the fallback
        });
      }, 1500);
    }
  }, [state, isAuthenticated]);

  useEffect(() => {
    saveState();
  }, [saveState]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
