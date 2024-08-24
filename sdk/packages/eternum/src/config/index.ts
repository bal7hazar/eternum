import { Account } from "starknet";

import {
  ARMY_ENTITY_TYPE,
  BUILDING_RESOURCE_PRODUCED,
  DONKEY_ENTITY_TYPE,
  EternumGlobalConfig,
  HYPERSTRUCTURE_TIME_BETWEEN_SHARES_CHANGE_S,
  RESOURCE_MULTIPLIER,
  RESOURCE_PRECISION,
  ResourcesIds,
  STAMINA_REFILL_PER_TICK,
} from "../constants";

import { BuildingType } from "../constants/structures";
import { EternumProvider } from "../provider";
import { TickIds, TravelTypes } from "../types";
import { scaleResourceInputs, scaleResourceOutputs, scaleResources } from "../utils";
import { EternumConfig } from "../types/config";

// Used to set the onchain configs w/ provided custom values.
// Use the ClientConfigManager to fetch modified values in the client.
export class ConfigManager {
  private readonly config: EternumConfig;

  constructor(customConfig: Partial<EternumConfig> = {}) {
    this.config = { ...EternumGlobalConfig, ...customConfig };
  }

  public setConfigs = async (account: Account, provider: EternumProvider) => {
    await this.setProductionConfig(account, provider);
    await this.setBuildingCategoryPopConfig(account, provider);
    await this.setPopulationConfig(account, provider);
    await this.setBuildingConfig(account, provider);
    await this.setResourceBuildingConfig(account, provider);
    await this.setWeightConfig(account, provider);
    await this.setCombatConfig(account, provider);
    await this.setHyperstructureConfig(account, provider);
    await this.setStaminaConfig(account, provider);
    await this.setStaminaRefillConfig(account, provider);
    await this.setMercenariesConfig(account, provider);
    await this.setupGlobals(account, provider);
    await this.setCapacityConfig(account, provider);
    await this.setSpeedConfig(account, provider);
  };

  private setProductionConfig = async (account: Account, provider: EternumProvider) => {
    const calldataArray = [];

    const resourceInputsScaled = scaleResourceInputs(this.config.RESOURCE_INPUTS, RESOURCE_MULTIPLIER);

    const resourceOutputsScaled = scaleResourceOutputs(this.config.RESOURCE_OUTPUTS, RESOURCE_MULTIPLIER);

    for (const resourceId of Object.keys(resourceInputsScaled) as unknown as ResourcesIds[]) {
      const calldata = {
        amount: resourceOutputsScaled[resourceId],
        resource_type: resourceId,
        cost: resourceInputsScaled[resourceId].map((cost) => {
          return {
            ...cost,
            amount: cost.amount,
          };
        }),
      };

      calldataArray.push(calldata);
    }

    const tx = await provider.set_production_config({ signer: account, calls: calldataArray });

    console.log(`Configuring resource production ${tx.statusReceipt}...`);
  };

  private setBuildingCategoryPopConfig = async (account: Account, provider: EternumProvider) => {
    const calldataArray = [];

    for (const buildingId of Object.keys(this.config.BUILDING_POPULATION) as unknown as BuildingType[]) {
      const buildingPopulation = this.config.BUILDING_POPULATION[buildingId];
      const buildingCapacity = this.config.BUILDING_CAPACITY[buildingId];

      // if both 0, tx will fail
      if (buildingPopulation !== 0 || buildingCapacity !== 0) {
        const callData = {
          building_category: buildingId,
          population: buildingPopulation,
          capacity: buildingCapacity,
        };

        calldataArray.push(callData);
      }
    }

    const tx = await provider.set_building_category_pop_config({
      signer: account,
      calls: calldataArray,
    });

    console.log(`Configuring building category population ${tx.statusReceipt}...`);
  };

  private setPopulationConfig = async (account: Account, provider: EternumProvider) => {
    const tx = await provider.set_population_config({
      signer: account,
      base_population: this.config.populationCapacity.base,
    });

    console.log(`Configuring population config ${tx.statusReceipt}...`);
  };

  private setBuildingConfig = async (account: Account, provider: EternumProvider) => {
    const calldataArray = [];
    const buildingCostsScaled = scaleResourceInputs(this.config.BUILDING_COSTS, RESOURCE_MULTIPLIER);

    for (const buildingId of Object.keys(BUILDING_RESOURCE_PRODUCED) as unknown as BuildingType[]) {
      if (buildingCostsScaled[buildingId].length !== 0) {
        const calldata = {
          building_category: buildingId,
          building_resource_type: BUILDING_RESOURCE_PRODUCED[buildingId],
          cost_of_building: buildingCostsScaled[buildingId].map((cost) => {
            return {
              ...cost,
              amount: cost.amount * RESOURCE_PRECISION,
            };
          }),
        };
        calldataArray.push(calldata);
      }
    }

    const tx = await provider.set_building_config({ signer: account, calls: calldataArray });

    console.log(`Configuring building cost config ${tx.statusReceipt}...`);
  };

  private setResourceBuildingConfig = async (account: Account, provider: EternumProvider) => {
    const calldataArray = [];
    const resourceBuildingCostsScaled = scaleResourceInputs(this.config.RESOURCE_BUILDING_COSTS, RESOURCE_MULTIPLIER);

    for (const resourceId of Object.keys(resourceBuildingCostsScaled) as unknown as ResourcesIds[]) {
      const calldata = {
        building_category: BuildingType.Resource,
        building_resource_type: resourceId,
        cost_of_building: resourceBuildingCostsScaled[resourceId].map((cost) => {
          return {
            ...cost,
            amount: cost.amount * RESOURCE_PRECISION,
          };
        }),
      };

      calldataArray.push(calldata);
    }

    const tx = await provider.set_building_config({ signer: account, calls: calldataArray });

    console.log(`Configuring resource building cost config ${tx.statusReceipt}...`);
  };

  private setWeightConfig = async (account: Account, provider: EternumProvider) => {
    const calldataArray = Object.entries(this.config.WEIGHTS_GRAM).map(([resourceId, weight]) => ({
      entity_type: resourceId,
      weight_gram: weight,
    }));

    const tx = await provider.set_weight_config({
      signer: account,
      calls: calldataArray,
    });

    console.log(`Configuring weight config  ${tx.statusReceipt}...`);
  };

  setCombatConfig = async (account: Account, provider: EternumProvider) => {
    const {
      health: health,
      knightStrength: knight_strength,
      paladinStrength: paladin_strength,
      crossbowmanStrength: crossbowman_strength,
      advantagePercent: advantage_percent,
      disadvantagePercent: disadvantage_percent,
      pillageHealthDivisor: pillage_health_divisor,
      baseArmyNumberForStructure: army_free_per_structure,
      armyExtraPerMilitaryBuilding: army_extra_per_military_building,
    } = this.config.troop;

    const tx = await provider.set_troop_config({
      signer: account,
      config_id: 0,
      health,
      knight_strength,
      paladin_strength,
      crossbowman_strength,
      advantage_percent,
      disadvantage_percent,
      pillage_health_divisor: pillage_health_divisor,
      army_free_per_structure: army_free_per_structure,
      army_extra_per_military_building: army_extra_per_military_building,
    });

    console.log(`Configuring combat config ${tx.statusReceipt}...`);
  };

  private setupGlobals = async (account: Account, provider: EternumProvider) => {
    // Set the bank config
    const txBank = await provider.set_bank_config({
      signer: account,
      lords_cost: this.config.banks.lordsCost * RESOURCE_PRECISION,
      lp_fee_num: this.config.banks.lpFeesNumerator,
      lp_fee_denom: this.config.banks.lpFeesDenominator,
    });

    console.log(`Configuring bank config ${txBank.statusReceipt}...`);

    const txDefaultTick = await provider.set_tick_config({
      signer: account,
      tick_id: TickIds.Default,
      tick_interval_in_seconds: this.config.tick.defaultTickIntervalInSeconds,
    });
    console.log(`Configuring tick config ${txDefaultTick.statusReceipt}...`);

    const txArmiesTick = await provider.set_tick_config({
      signer: account,
      tick_id: TickIds.Armies,
      tick_interval_in_seconds: this.config.tick.armiesTickIntervalInSeconds,
    });

    console.log(`Configuring tick config ${txArmiesTick.statusReceipt}...`);

    // TODO: Explore config
    const txExplore = await provider.set_exploration_config({
      signer: account,
      wheat_burn_amount: this.config.exploration.burn[ResourcesIds.Wheat] * RESOURCE_PRECISION,
      fish_burn_amount: this.config.exploration.burn[ResourcesIds.Fish] * RESOURCE_PRECISION,
      reward_amount: this.config.exploration.reward * RESOURCE_PRECISION,
      shards_mines_fail_probability: this.config.exploration.shardsMinesFailProbability,
    });

    console.log(`Configuring exploration config ${txExplore.statusReceipt}...`);

    const txExploreStaminaCost = await provider.set_travel_stamina_cost_config({
      signer: account,
      travel_type: BigInt(TravelTypes.Explore),
      cost: this.config.staminaCost.explore,
    });
    console.log(`Configuring exploreStaminaCost config ${txExploreStaminaCost.statusReceipt}...`);

    const txTravelStaminaCost = await provider.set_travel_stamina_cost_config({
      signer: account,
      travel_type: TravelTypes.Travel,
      cost: this.config.staminaCost.travel,
    });

    console.log(`Configuring travel stamina cost config ${txTravelStaminaCost.statusReceipt}...`);
  };

  private setCapacityConfig = async (account: Account, provider: EternumProvider) => {
    const txDonkey = await provider.set_capacity_config({
      signer: account,
      entity_type: DONKEY_ENTITY_TYPE,
      weight_gram: this.config.carryCapacityGram.donkey,
    });

    console.log(`Configuring capacity Donkey config ${txDonkey.statusReceipt}...`);

    const txArmy = await provider.set_capacity_config({
      signer: account,
      entity_type: ARMY_ENTITY_TYPE,
      weight_gram: this.config.carryCapacityGram.army,
    });

    console.log(`Configuring capacity Army config ${txArmy.statusReceipt}...`);
  };

  private setSpeedConfig = async (account: Account, provider: EternumProvider) => {
    const txDonkey = await provider.set_speed_config({
      signer: account,
      entity_type: DONKEY_ENTITY_TYPE,
      sec_per_km: this.config.speed.donkey,
    });

    console.log(`Configuring speed Donkey config ${txDonkey.statusReceipt}...`);

    const txArmy = await provider.set_speed_config({
      signer: account,
      entity_type: ARMY_ENTITY_TYPE,
      sec_per_km: this.config.speed.army,
    });

    console.log(`Configuring speed Army config ${txArmy.statusReceipt}...`);
  };

  private setHyperstructureConfig = async (account: Account, provider: EternumProvider) => {
    const hyperstructureTotalCosts = [
      ...this.config.HYPERSTRUCTURE_CONSTRUCTION_COSTS,
      ...this.config.HYPERSTRUCTURE_CREATION_COSTS,
    ];

    const hyperstructureTotalCostsScaled = scaleResources(hyperstructureTotalCosts, RESOURCE_MULTIPLIER);

    const tx = await provider.set_hyperstructure_config({
      signer: account,
      time_between_shares_change: HYPERSTRUCTURE_TIME_BETWEEN_SHARES_CHANGE_S,
      resources_for_completion: hyperstructureTotalCostsScaled.map((resource) => ({
        ...resource,
        amount: resource.amount * RESOURCE_PRECISION,
      })),
    });
    console.log(`Configuring hyperstructure ${tx.statusReceipt}...`);
  };

  private setStaminaConfig = async (account: Account, provider: EternumProvider) => {
    for (const [unit_type, stamina] of Object.entries(this.config.TROOPS_STAMINAS)) {
      const tx = await provider.set_stamina_config({
        signer: account,
        unit_type: unit_type,
        max_stamina: stamina,
      });
      console.log(`Configuring staminas ${unit_type} ${tx.statusReceipt}...`);
    }
  };

  private setStaminaRefillConfig = async (account: Account, provider: EternumProvider) => {
    const tx = await provider.set_stamina_refill_config({
      signer: account,
      amount_per_tick: STAMINA_REFILL_PER_TICK,
    });
    console.log(`Configuring stamina refill per tick to ${STAMINA_REFILL_PER_TICK} ${tx.statusReceipt}...`);
  };

  private setMercenariesConfig = async (account: Account, provider: EternumProvider) => {
    const tx = await provider.set_mercenaries_config({
      signer: account,
      troops: {
        knight_count: BigInt(this.config.mercenaries.troops.knight_count) * BigInt(RESOURCE_PRECISION),
        paladin_count: BigInt(this.config.mercenaries.troops.paladin_count) * BigInt(RESOURCE_PRECISION),
        crossbowman_count: BigInt(this.config.mercenaries.troops.crossbowman_count) * BigInt(RESOURCE_PRECISION),
      },
      rewards: this.config.mercenaries.rewards.map((reward) => ({
        resource: reward.resourceId,
        amount: reward.amount * RESOURCE_PRECISION * RESOURCE_MULTIPLIER,
      })),
    });
    console.log(`Configuring mercenaries ${tx.statusReceipt}...`);
  };
}
