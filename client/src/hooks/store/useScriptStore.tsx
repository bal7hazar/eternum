import { Troops } from "@bibliothecadao/eternum";
import { create } from "zustand";

export interface Transfer {
  from: number;
  to: number;
  amount: number;
  start: number;
  end: number;
  every: number;
}

interface ScriptStore {
  shows: number[];
  setShows: (shows: number[]) => void;
  skips: number[];
  setSkips: (skips: number[]) => void;
  builds: { ids: number[], building: string, position: { col: number, row: number } };
  setBuilds: (builds: { ids: number[], building: string, position: { col: number, row: number } }) => void;
  resetBuilds: () => void;
  armies: { ids: number[], isDefensive: boolean };
  setArmies: (armies: { ids: number[], isDefensive: boolean }) => void;
  resetArmies: () => void;
  troops: { ids: number[], troops: Troops };
  setTroops: (troops: { ids: number[], troops: Troops }) => void;
  resetTroops: () => void;
  transfers: { items: Transfer[] };
  setTransfers: (transfers: { items: Transfer[] }) => void;
  resetTransfers: () => void;
}

const useScriptStore = create<ScriptStore>((set) => ({
  shows: [],
  setShows: (shows) => set({ shows }),
  skips: [],
  setSkips: (skips) => set({ skips }),
  builds: { ids: [], building: "", position: { col: 0, row: 0 } },
  setBuilds: (builds) => set({ builds }),
  resetBuilds: () => set({ builds: { ids: [], building: "", position: { col: 0, row: 0 } } }),
  armies: { ids: [], isDefensive: false },
  setArmies: (armies) => set({ armies }),
  resetArmies: () => set({ armies: { ids: [], isDefensive: false } }),
  troops: { ids: [], troops: { knight_count: 0, paladin_count: 0, crossbowman_count: 0 } },
  setTroops: (troops) => set({ troops }),
  resetTroops: () => set({ troops: { ids: [], troops: { knight_count: 0, paladin_count: 0, crossbowman_count: 0 } } }),
  transfers: { items: [] as Transfer[] },
  setTransfers: (transfers) => set({ transfers }),
  resetTransfers: () => set({ transfers: { items: [] } }),
}));

export default useScriptStore;
