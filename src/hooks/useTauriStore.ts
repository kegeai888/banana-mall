import { useEffect } from "react";
import { Store } from "@tauri-apps/plugin-store";
import { useAppStore } from "@/stores/useAppStore";

/**
 * Hook to initialize Tauri store and load persisted settings
 */
export function useTauriStore() {
  const { initializeStore } = useAppStore();

  useEffect(() => {
    const init = async () => {
      try {
        // Tauri v2 Store API - Store.load() is a static method
        // @ts-ignore - Store API may vary, this will work at runtime
        const store = await Store.load(".settings.dat");
        await initializeStore(store);
      } catch (error) {
        console.warn(
          "Store initialization failed, falling back to localStorage:",
          error
        );

        // Fallback: load settings and histories from localStorage in web env
        if (typeof window !== "undefined") {
          try {
            const settingsRaw = window.localStorage.getItem(
              "bananaMallSettings"
            );
            const historiesRaw = window.localStorage.getItem(
              "bananaMallHistories"
            );

            if (settingsRaw) {
              const parsed = JSON.parse(settingsRaw);
              useAppStore.setState((state) => ({
                settings: { ...state.settings, ...parsed },
              }));
            }

            if (historiesRaw) {
              const parsedHistories = JSON.parse(historiesRaw);
              useAppStore.setState(() => ({
                histories: Array.isArray(parsedHistories)
                  ? parsedHistories
                  : [],
              }));
            }
          } catch (e) {
            console.warn("Failed to load from localStorage", e);
          }
        }
      }
    };

    init();
  }, [initializeStore]);
}
