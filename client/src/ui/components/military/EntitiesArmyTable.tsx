import { ArmyInfo, useEntityArmies } from "@/hooks/helpers/useArmies";
import { useEntities } from "@/hooks/helpers/useEntities";
import { Headline } from "@/ui/elements/Headline";
import { EternumGlobalConfig } from "@bibliothecadao/eternum";
import { ArmyChip } from "./ArmyChip";

type EntityArmyTableProps = {
  entityId: bigint | undefined;
};

export const EntityArmyTable = ({ entityId }: EntityArmyTableProps) => {
  if (!entityId) {
    return <div>Entity not found</div>;
  }
  const { entityArmies } = useEntityArmies({ entity_id: entityId });

  if (entityArmies.length === 0) {
    return <div className="m-auto">No armies</div>;
  }

  const armyElements = () => {
    return entityArmies
      .filter((army) => BigInt(army?.current || 0) / EternumGlobalConfig.troop.healthPrecision > 0)
      .map((army: ArmyInfo) => {
        return <ArmyChip key={army.entity_id} army={army} />;
      });
  };

  return <div className="flex flex-col gap-4">{armyElements()}</div>;
};

export const EntitiesArmyTable = () => {
  const { playerStructures } = useEntities();

  return playerStructures().map((entity: any) => {
    return (
      <div key={entity.entity_id} className="p-2">
        <Headline className="my-3">{entity.name}</Headline>
        <div className="grid grid-cols-1 gap-4">
          <EntityArmyTable entityId={entity.entity_id} />
        </div>
      </div>
    );
  });
};
