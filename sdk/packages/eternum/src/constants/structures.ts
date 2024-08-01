import { CairoCustomEnum } from "starknet";
import { ResourcesIds } from "../constants";

/** @knipignore */
export enum StructureType {
  Realm = 1,
  Hyperstructure = 2,
  Bank = 3,
  FragmentMine = 4,
  Settlement = 5,
}

export enum BuildingType {
  Castle = 1,
  Resource = 2,
  Farm = 3,
  FishingVillage = 4,
  Barracks = 5,
  Market = 6,
  ArcheryRange = 7,
  Stable = 8,
  TradingPost = 9,
  WorkersHut = 10,
  WatchTower = 11,
  Walls = 12,
  Storehouse = 13,
  Bank = 14,
  FragmentMine = 15,
}
export const MAX_BUILDING_TYPE = 14;

export enum ResourceBuildingType {
  Wood = 1,
  Stone = 2,
  Coal = 3,
  Copper = 4,
  Obsidian = 5,
  Silver = 6,
  Ironwood = 7,
  ColdIron = 8,
  Gold = 9,
  Hartwood = 10,
  Diamonds = 11,
  Sapphire = 12,
  Ruby = 13,
  DeepCrystal = 14,
  Ignium = 15,
  EtherealSilica = 16,
  TrueIce = 17,
  TwilightQuartz = 18,
  AlchemicalSilver = 19,
  Adamantine = 20,
  Mithral = 21,
  Dragonhide = 22,
}

export const CombinedBuildingTypes = {
  ...BuildingType,
  ...ResourceBuildingType,
};

export const BuildingEnumToString: { [index: number]: string } = {
  0: "None",
  1: "Castle",
  2: "Resource",
  3: "Farm",
  4: "Fishing Village",
  5: "Barracks",
  6: "Market",
  7: "Archery Range",
  8: "Stable",
  9: "Trading Post",
  10: "Workers Hut",
  11: "Watch Tower",
  12: "Walls",
  13: "Storehouse",
  14: "Bank",
  15: "Shards Mine",
};

export const BuildingStringToEnum = {
  None: 0,
  Castle: 1,
  Resource: 2,
  Farm: 3,
  FishingVillage: 4,
  Barracks: 5,
  Market: 6,
  ArcheryRange: 7,
  Stable: 8,
  TradingPost: 9,
  WorkersHut: 10,
  WatchTower: 11,
  Walls: 12,
  Storehouse: 13,
  Bank: 14,
  FragmentMine: 15,
};

export function getBuildingType(name: BuildingType): CairoCustomEnum {
  switch (name) {
    case BuildingType.Castle:
      return new CairoCustomEnum({ Castle: {} });
    case BuildingType.Resource:
      return new CairoCustomEnum({ Resource: {} });
    case BuildingType.Farm:
      return new CairoCustomEnum({ Farm: {} });
    case BuildingType.FishingVillage:
      return new CairoCustomEnum({ FishingVillage: {} });
    case BuildingType.Barracks:
      return new CairoCustomEnum({ Barracks: {} });
    case BuildingType.Market:
      return new CairoCustomEnum({ Market: {} });
    case BuildingType.ArcheryRange:
      return new CairoCustomEnum({ ArcheryRange: {} });
    case BuildingType.Stable:
      return new CairoCustomEnum({ Stable: {} });
    case BuildingType.TradingPost:
      return new CairoCustomEnum({ TradingPost: {} });
    case BuildingType.WorkersHut:
      return new CairoCustomEnum({ WorkersHut: {} });
    case BuildingType.WatchTower:
      return new CairoCustomEnum({ WatchTower: {} });
    case BuildingType.Walls:
      return new CairoCustomEnum({ Walls: {} });
    case BuildingType.Storehouse:
      return new CairoCustomEnum({ Storehouse: {} });
    case BuildingType.Bank:
      return new CairoCustomEnum({ Bank: {} });
    case BuildingType.FragmentMine:
      return new CairoCustomEnum({ FragmentMine: {} });
  }
}

export function getProducedResource(name: BuildingType): number {
  switch (name) {
    case BuildingType.Castle:
      return 0;
    case BuildingType.Resource:
      return 0;
    case BuildingType.Farm:
      return ResourcesIds.Wheat;
    case BuildingType.FishingVillage:
      return ResourcesIds.Fish;
    case BuildingType.Barracks:
      return ResourcesIds.Knight;
    case BuildingType.Market:
      return 0;
    case BuildingType.ArcheryRange:
      return ResourcesIds.Crossbowman;
    case BuildingType.Stable:
      return ResourcesIds.Paladin;
    case BuildingType.TradingPost:
      return 0;
    case BuildingType.WorkersHut:
      return 0;
    case BuildingType.WatchTower:
      return 0;
    case BuildingType.Walls:
      return 0;
    case BuildingType.Storehouse:
      return 0;
    case BuildingType.Bank:
      return 0;
    case BuildingType.FragmentMine:
      return 0;
  }
}

export enum EntityState {
  Traveling,
  WaitingForDeparture,
  Idle,
  WaitingToOffload,
  NotApplicable, // When the entity should not be rendered
}

export function determineEntityState(
  nextBlockTimestamp: number | undefined,
  blocked: boolean | undefined,
  arrivalTime: bigint | undefined,
  hasResources: boolean,
): EntityState {
  const isTraveling =
    !blocked && nextBlockTimestamp !== undefined && arrivalTime !== undefined && arrivalTime > nextBlockTimestamp;
  const isWaitingForDeparture = blocked;
  const isIdle = !isTraveling && !isWaitingForDeparture && !hasResources;
  const isWaitingToOffload = !blocked && !isTraveling && hasResources;

  if (isTraveling) {
    return EntityState.Traveling;
  }
  if (isWaitingForDeparture) {
    return EntityState.WaitingForDeparture;
  }
  if (isIdle) {
    return EntityState.Idle;
  }
  if (isWaitingToOffload) {
    return EntityState.WaitingToOffload;
  }
  return EntityState.Idle; // Default state
}
