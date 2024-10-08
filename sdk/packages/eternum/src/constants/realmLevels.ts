import { ResourcesIds } from ".";

export enum RealmLevels {
  Settlement = 1,
  City,
  Kingdom,
  Empire,
}

export enum RealmLevelNames {
  Settlement = "Settlement",
  City = "City",
  Kingdom = "Kingdom",
  Empire = "Empire",
}

export const REALM_UPGRADE_COSTS = {
  [RealmLevels.Settlement]: [],

  [RealmLevels.City]: [
    { resource: ResourcesIds.Wood, amount: 2000 },
    { resource: ResourcesIds.Stone, amount: 2000 },
    { resource: ResourcesIds.Coal, amount: 1200 },
    { resource: ResourcesIds.Silver, amount: 1200 },
  ],

  [RealmLevels.Kingdom]: [
    { resource: ResourcesIds.ColdIron, amount: 2000 },
    { resource: ResourcesIds.Hartwood, amount: 1000 },
    { resource: ResourcesIds.Diamonds, amount: 750 },
    { resource: ResourcesIds.Sapphire, amount: 750 },
    { resource: ResourcesIds.DeepCrystal, amount: 750 },
  ],

  [RealmLevels.Empire]: [
    { resource: ResourcesIds.Adamantine, amount: 100 },
    { resource: ResourcesIds.Mithral, amount: 100 },
    { resource: ResourcesIds.Dragonhide, amount: 100 },
    { resource: ResourcesIds.Wood, amount: 200 },
    { resource: ResourcesIds.Stone, amount: 200 },
  ],
};

export const LEVEL_DESCRIPTIONS = {
  [RealmLevels.Settlement]: "A small settlement with a few buildings. You have 6 buildable hexes.",
  [RealmLevels.City]: "A city with a few districts and many buildings. You have 18 buildable hexes.",
  [RealmLevels.Kingdom]: "A kingdom with many cities and districts.You have 36 buildable hexes.",
  [RealmLevels.Empire]: "An empire with many kingdoms and cities. You have 60 buildable hexes.",
};
