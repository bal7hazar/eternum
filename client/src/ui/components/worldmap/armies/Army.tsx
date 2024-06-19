import { ArmyInfo } from "@/hooks/helpers/useArmies";
import { getBattlesByPosition } from "@/hooks/helpers/useBattles";
import React, { useMemo } from "react";
import { Euler, Vector3 } from "three";
import useUIStore from "../../../../hooks/store/useUIStore";
import { WarriorModel } from "../../models/armies/WarriorModel";
import { SelectedUnit } from "../hexagon/SelectedUnit";
import { ArmyFlag } from "./ArmyFlag";
import { ArmyHitBox } from "./ArmyHitBox";
import { CombatLabel } from "./CombatLabel";
import { useArmyAnimation } from "./useArmyAnimation";
import { arePropsEqual } from "./utils";

type ArmyProps = {
  army: ArmyInfo;
};

export const Army = React.memo(({ army }: ArmyProps & JSX.IntrinsicElements["group"]) => {
  const selectedEntity = useUIStore((state) => state.selectedEntity);
  const battleAtPosition = getBattlesByPosition({ x: army.x, y: army.y });

  // animation path for the army
  const armyPosition = { x: army.x, y: army.y };
  const groupRef = useArmyAnimation(armyPosition, army.offset);

  // Deterministic rotation based on the id
  const deterministicRotation = useMemo(() => {
    return (Number(army.entity_id) % 12) * (Math.PI / 6); // Convert to one of 12 directions in radians
  }, []);

  const initialPos = useMemo(() => {
    return new Vector3(army.uiPos.x + army.offset.x, 0.32, -army.uiPos.y - army.offset.y);
  }, []);

  const isSelected = useMemo(() => {
    return (selectedEntity?.id || 0n) === BigInt(army.entity_id);
  }, [selectedEntity, army.entity_id]);

  const showCombatLabel = useMemo(() => {
    if (battleAtPosition) return false;
    return selectedEntity !== undefined && selectedEntity.id === BigInt(army.entity_id);
  }, [selectedEntity]);

  // Army can be self owned or enemy
  // location can have a structure or no strucutre and this strucutre can be owned by self or enemy

  return (
    <>
      <group position={initialPos} ref={groupRef} rotation={new Euler(0, deterministicRotation, 0)}>
        <ArmyFlag visible={army.isMine} rotationY={deterministicRotation} position={initialPos} />
        {showCombatLabel && <CombatLabel visible={isSelected} />}
        <WarriorModel />
        <ArmyHitBox army={army} />
      </group>
      {isSelected && <SelectedUnit position={{ x: army.x, y: army.y }} />}
    </>
  );
}, arePropsEqual);
