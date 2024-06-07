import {
  HyperstructureEventInterface,
  parseHyperstructureFinishedEventData,
} from "@/dojo/events/hyperstructureEventQueries";
import { Position, StructureType } from "@bibliothecadao/eternum";
import { useEntityQuery } from "@dojoengine/react";
import { Has, getComponentValue } from "@dojoengine/recs";
import { useEffect, useMemo, useRef, useState } from "react";
import { ClickedHex, HexPosition, Hexagon, HighlightPositions } from "../../types";
import { useDojo } from "../context/DojoContext";
import useLeaderBoardStore from "./useLeaderBoardStore";
import useUIStore from "./useUIStore";

export enum ArmyMode {
  Travel,
  Explore,
  Attack,
}

export interface MapStore {
  worldMapBuilding: StructureType | null;
  setWorldMapBuilding: (building: StructureType | null) => void;
  clickedHex: ClickedHex | undefined;
  setClickedHex: (hex: ClickedHex | undefined) => void;
  hexData: Hexagon[] | undefined;
  setHexData: (hexData: Hexagon[]) => void;
  selectedEntity: { id: bigint; position: Position } | undefined;
  setSelectedEntity: (entity: { id: bigint; position: Position } | undefined) => void;
  targetEntity: bigint;
  setTargetEntity: (entityId: bigint) => void;
  animationPaths: { id: bigint; path: Position[]; enemy: boolean }[];
  setAnimationPaths: (path: { id: bigint; path: Position[]; enemy: boolean }[]) => void;
  armyMode: ArmyMode | null;
  setArmyMode: (mode: ArmyMode | null) => void;
  highlightPath: HighlightPositions;
  setHighlightPath: (positions: HighlightPositions) => void;
  highlightPositions: HighlightPositions;
  setHighlightPositions: (positions: HighlightPositions) => void;
  hoveredHex: HexPosition | undefined;
  setHoveredHex: (position: HexPosition | undefined) => void;
  clearSelection: () => void;
  showAllArmies: boolean;
  toggleShowAllArmies: () => void;
  existingStructures: { col: number; row: number; type: StructureType; entityId: bigint }[];
  setExistingStructures: (
    existingStructures: { col: number; row: number; type: StructureType; entityId: bigint }[],
  ) => void;
}

export const createMapStoreSlice = (set: any) => ({
  worldMapBuilding: null,
  setWorldMapBuilding: (building: StructureType | null) => {
    set({ worldMapBuilding: building });
  },
  clickedHex: undefined,
  setClickedHex: (hex: ClickedHex | undefined) => {
    set({ clickedHex: hex });
  },
  hexData: undefined,
  setHexData: (hexData: Hexagon[]) => {
    set({ hexData });
  },
  selectedEntity: undefined,
  setSelectedEntity: (entity: { id: bigint; position: Position } | undefined) => set({ selectedEntity: entity }),
  targetEntity: 0n,
  setTargetEntity: (entityId: bigint | undefined) => set({ targetEntity: entityId }),
  animationPaths: [],
  setAnimationPaths: (animationPaths: { id: bigint; path: Position[]; enemy: boolean }[]) => set({ animationPaths }),
  armyMode: null,
  setArmyMode: (armyMode: ArmyMode | null) => set({ armyMode }),
  highlightPath: { pos: [], color: 0 },
  setHighlightPath: (positions: HighlightPositions) => set({ highlightPath: positions }),
  highlightPositions: { pos: [], color: 0 },
  setHighlightPositions: (positions: HighlightPositions) => {
    set({ highlightPositions: positions });
  },
  hoveredHex: undefined,
  setHoveredHex: (position: HexPosition | undefined) => set({ hoveredHex: position }),
  clearSelection: () =>
    set({
      selectedEntity: undefined,
      armyMode: null,
      highlightPath: { pos: [], color: 0 },
      highlightPositions: { pos: [], color: 0 },
    }),
  showAllArmies: false,
  toggleShowAllArmies: () => {
    set((state: MapStore) => {
      return { showAllArmies: !state.showAllArmies };
    });
  },
  existingStructures: [],
  setExistingStructures: (existingStructures: { col: number; row: number; type: StructureType; entityId: bigint }[]) =>
    set({ existingStructures }),
});

export const useSetExistingStructures = () => {
  const [newFinishedHs, setNewFinishedHs] = useState<HyperstructureEventInterface | null>(null);
  const {
    setup,
    account: { account },
    masterAccount,
  } = useDojo();
  const subCreated = useRef<boolean>(false);

  const setExistingStructures = useUIStore((state) => state.setExistingStructures);
  const finishedHyperstructures = useLeaderBoardStore((state) => state.finishedHyperstructures);
  const setFinishedHyperstructures = useLeaderBoardStore((state) => state.setFinishedHyperstructures);

  const builtStructures = useEntityQuery([Has(setup.components.Structure)]);

  useEffect(() => {
    if (newFinishedHs === null) return;
    setFinishedHyperstructures([...finishedHyperstructures, newFinishedHs]);
  }, [newFinishedHs]);

  useEffect(() => {
    const subscription = async () => {
      const observable = await setup.updates.eventUpdates.hyperstructureFinishedEvents();
      let events: HyperstructureEventInterface[] = [];

      const sub = observable.subscribe((event) => {
        if (event) {
          const parsedEvent: HyperstructureEventInterface = parseHyperstructureFinishedEventData(event);
          events.push(parsedEvent);
          setNewFinishedHs(parsedEvent);
        }
      });
      setFinishedHyperstructures(events);

      // Cleanup function to unsubscribe on unmount
      return () => {
        sub.unsubscribe();
      };
    };
    if (subCreated.current) return;
    subscription();
    subCreated.current = true;
  }, []);

  useMemo(() => {
    const _tmp = builtStructures
      .map((entity) => {
        const position = getComponentValue(setup.components.Position, entity);
        const structure = getComponentValue(setup.components.Structure, entity);
        const owner = getComponentValue(setup.components.Owner, entity);
        const type = StructureType[structure!.category as keyof typeof StructureType];
        if (account.address === masterAccount.address) return null;
        if (!position || !structure || !owner) return null;
        const isMine = owner?.address === BigInt(account.address);
        return {
          col: position.x,
          row: position.y,
          type: type as StructureType,
          entity: entity,
          entityId: structure.entity_id,
          isMine,
        };
      })
      .filter(Boolean) as { col: number; row: number; type: StructureType; entityId: bigint }[];

    setExistingStructures(_tmp);
  }, [builtStructures, account.address]);
};
