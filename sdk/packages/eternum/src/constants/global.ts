import { ResourcesIds } from "./resources";

export const EternumGlobalConfig = {
  stamina: {
    travelCost: 5,
    exploreCost: 15,
  },
  resources: {
    resourcePrecision: 1000,
    resourceMultiplier: 1000,
    resourceAmountPerTick: 10,
    foodPerTick: 30,
    donkeysPerTick: 3,
    knightsPerTick: 2,
    crossbowmenPerTick: 2,
    paladinPerTick: 2,
  },
  banks: {
    lordsCost: 1000,
    lpFees: 922337203685477580,
  },
  weights: {
    resource: 1000,
    currency: 1,
    food: 100,
  },
  populationCapacity: {
    workerHuts: 5,
  },
  exploration: {
    wheatBurn: 50,
    fishBurn: 50,
    reward: 20,
    shardsMinesFailProbability: 10000,
  },
  tick: {
    defaultTickIntervalInSeconds: 1,
    armiesTickIntervalInSeconds: 60,
  },
  carryCapacity: {
    donkey: 100,
    army: 100,
  },
  speed: {
    donkey: 1,
    army: 1,
  },
  troop: {
    knightHealth: 7_200,
    paladinHealth: 7_200,
    crossbowmanHealth: 7_200,
    knightStrength: 1,
    paladinStrength: 1,
    crossbowmanStrength: 1,
    advantagePercent: 1000,
    disadvantagePercent: 1000,
  },
};

export enum TickIds {
  Default = 0,
  Armies = 1,
}

export const TROOPS_STAMINAS = {
  [ResourcesIds.Paladin]: 100,
  [ResourcesIds.Knight]: 80,
  [ResourcesIds.Crossbowmen]: 80,
};

export const WORLD_CONFIG_ID = 999999999999999999n;
export const U32_MAX = 4294967295;
export const MAX_NAME_LENGTH = 31;
export const ONE_MONTH = 2628000;

// Buildings
export const BASE_POPULATION_CAPACITY = 5;
export const STOREHOUSE_CAPACITY = 10000000;

// Points
export const HYPERSTRUCTURE_POINTS_PER_CYCLE = 10;

// Entity Types
export const DONKEY_ENTITY_TYPE = 256;
export const REALM_ENTITY_TYPE = 257;
export const ARMY_ENTITY_TYPE = 258;
