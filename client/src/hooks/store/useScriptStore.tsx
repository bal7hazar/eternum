import { create } from "zustand";

interface ScriptStore {
  shows: number[];
  setShows: (shows: number[]) => void;
  skips: number[];
  setSkips: (skips: number[]) => void;
  builds: { ids: number[], building: string, position: { col: number, row: number } };
  setBuilds: (builds: { ids: number[], building: string, position: { col: number, row: number } }) => void;
  resetBuilds: () => void;
}

const useScriptStore = create<ScriptStore>((set) => ({
  shows: [],
  setShows: (shows) => set({ shows }),
  skips: [],
  setSkips: (skips) => set({ skips }),
  builds: { ids: [], building: "", position: { col: 0, row: 0 } },
  setBuilds: (builds) => set({ builds }),
  resetBuilds: () => set({ builds: { ids: [], building: "", position: { col: 0, row: 0 } } }),
}));

export default useScriptStore;
