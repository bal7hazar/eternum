import { create } from "zustand";

interface ScriptStore {
  shows: number[];
  setShows: (shows: number[]) => void;
  skips: number[];
  setSkips: (skips: number[]) => void;
}

const useScriptStore = create<ScriptStore>((set) => ({
  shows: [],
  setShows: (shows) => set({ shows }),
  skips: [],
  setSkips: (skips) => set({ skips }),
}));

export default useScriptStore;
