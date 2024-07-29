import { BattleManager } from "@/dojo/modelManager/BattleManager";
import { useDojo } from "@/hooks/context/DojoContext";
import { ArmyInfo, useArmiesByEntityOwner } from "@/hooks/helpers/useArmies";
import { PlayerStructure } from "@/hooks/helpers/useEntities";
import useBlockchainStore from "@/hooks/store/useBlockchainStore";
import { useQuestStore } from "@/hooks/store/useQuestStore";
import useUIStore from "@/hooks/store/useUIStore";
import { QuestId } from "@/ui/components/quest/questDetails";
import Button from "@/ui/elements/Button";
import { BuildingType, EternumGlobalConfig } from "@bibliothecadao/eternum";
import clsx from "clsx";
import React, { useMemo, useState } from "react";
import { EntityList } from "../list/EntityList";
import { InventoryResources } from "../resources/InventoryResources";
import { ArmyManagementCard } from "./ArmyManagementCard";

const MAX_AMOUNT_OF_DEFENSIVE_ARMIES = 1;

enum Loading {
  None,
  CreateDefensive,
  CreateAttacking,
}

export const EntityArmyList = ({ structure }: { structure: PlayerStructure }) => {
  const existingBuildings = useUIStore((state) => state.existingBuildings);

  const { entityArmies: structureArmies } = useArmiesByEntityOwner({
    entity_owner_entity_id: structure?.entity_id || 0n,
  });

  const selectedQuest = useQuestStore((state) => state.selectedQuest);

  const {
    account: { account },
    setup: {
      systemCalls: { create_army },
    },
  } = useDojo();

  const [loading, setLoading] = useState<Loading>(Loading.None);

  const maxAmountOfAttackingArmies = useMemo(() => {
    return (
      EternumGlobalConfig.troop.baseArmyNumberForStructure +
      existingBuildings.filter(
        (building) =>
          building.type === BuildingType.ArcheryRange ||
          building.type === BuildingType.Barracks ||
          building.type === BuildingType.Stable,
      ).length *
        EternumGlobalConfig.troop.armyExtraPerMilitaryBuilding
    );
  }, [existingBuildings]);

  const numberAttackingArmies = useMemo(() => {
    return structureArmies.filter((army) => !army.protectee).length;
  }, [structureArmies]);

  const numberDefensiveArmies = useMemo(() => {
    return structureArmies.filter((army) => army.protectee).length;
  }, [structureArmies]);

  const canCreateProtector = useMemo(
    () => numberDefensiveArmies < MAX_AMOUNT_OF_DEFENSIVE_ARMIES,
    [numberDefensiveArmies],
  );

  const handleCreateArmy = (is_defensive_army: boolean) => {
    if (!structure.entity_id) throw new Error("Structure's entity id is undefined");
    setLoading(is_defensive_army ? Loading.CreateDefensive : Loading.CreateAttacking);
    create_army({
      signer: account,
      army_owner_id: structure.entity_id,
      is_defensive_army,
    }).finally(() => setLoading(Loading.None));
  };

  return (
    <>
      <EntityList
        list={structureArmies}
        headerPanel={
          <>
            {" "}
            <div className="px-3 py-2 bg-blueish/20 clip-angled-sm font-bold">
              First you must create an Army then you can enlist troops to it. You can only have one defensive army.
            </div>
            <div className="flex justify-between">
              <div
                className={`mt-2 font-bold ${
                  numberAttackingArmies < maxAmountOfAttackingArmies ? "text-green" : "text-red"
                }`}
              >
                {numberAttackingArmies} / {maxAmountOfAttackingArmies} attacking armies
              </div>
              <div
                className={`mt-2 font-bold ${
                  numberDefensiveArmies < MAX_AMOUNT_OF_DEFENSIVE_ARMIES ? "text-green" : "text-red"
                }`}
              >
                {numberDefensiveArmies} / {MAX_AMOUNT_OF_DEFENSIVE_ARMIES} defending army
              </div>
            </div>
            <div className="w-full flex justify-between my-4">
              <Button
                isLoading={loading === Loading.CreateAttacking}
                variant="primary"
                onClick={() => handleCreateArmy(false)}
                disabled={loading !== Loading.None || numberAttackingArmies >= maxAmountOfAttackingArmies}
                className={clsx({
                  "animate-pulse": selectedQuest?.id === QuestId.CreateArmy,
                })}
              >
                Create Army
              </Button>

              <Button
                isLoading={loading === Loading.CreateDefensive}
                variant="primary"
                onClick={() => handleCreateArmy(true)}
                disabled={loading !== Loading.None || !canCreateProtector}
              >
                Create Defense Army
              </Button>
            </div>
          </>
        }
        title="armies"
        panel={({ entity, setSelectedEntity }) => (
          <ArmyItem entity={entity} setSelectedEntity={setSelectedEntity} structure={structure} />
        )}
        questing={selectedQuest?.id === QuestId.CreateArmy}
      />
    </>
  );
};

const ArmyItem = ({
  entity,
  setSelectedEntity,
  structure,
}: {
  entity: ArmyInfo | undefined;
  setSelectedEntity: ((entity: ArmyInfo | null) => void) | undefined;
  structure: PlayerStructure;
}) => {
  const dojo = useDojo();

  const { nextBlockTimestamp: currentTimestamp } = useBlockchainStore();

  const battleManager = useMemo(() => new BattleManager(entity?.battle_id || 0n, dojo), [entity?.battle_id, dojo]);

  const updatedArmy = useMemo(() => {
    if (!currentTimestamp) throw new Error("Current timestamp is undefined");
    const updatedBattle = battleManager.getUpdatedBattle(currentTimestamp!);
    const updatedArmy = battleManager.getUpdatedArmy(entity, updatedBattle);
    return updatedArmy;
  }, [currentTimestamp, entity]);

  return (
    <React.Fragment key={entity?.entity_id || 0}>
      <ArmyManagementCard
        owner_entity={structure?.entity_id || 0n}
        army={updatedArmy}
        setSelectedEntity={setSelectedEntity}
      />
      <InventoryResources entityIds={[entity?.entity_id || 0n]} />
    </React.Fragment>
  );
};
