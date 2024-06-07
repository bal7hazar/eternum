import { HyperstructureEventInterface } from "@/dojo/events/hyperstructureEventQueries";
import useLeaderBoardStore from "@/hooks/store/useLeaderBoardStore";
import useUIStore from "@/hooks/store/useUIStore";
import { CombatLabel } from "@/ui/components/worldmap/armies/CombatLabel";
import { getUIPositionFromColRow } from "@/ui/utils/utils";
import { StructureType } from "@bibliothecadao/eternum";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

export const Structures = () => {
  const models = useMemo(
    () => [
      useGLTF("/models/buildings/hyperstructure-half-transformed.glb"),
      useGLTF("/models/buildings/castle.glb"),
      useGLTF("/models/buildings/hyperstructure.glb"),
      useGLTF("/models/buildings/bank.glb"),
      useGLTF("/models/buildings/mine.glb"),
      useGLTF("/models/buildings/castle.glb"),
    ],
    [],
  );

  const existingStructures = useUIStore((state) => state.existingStructures);
  return existingStructures.map((structure, index) => {
    return <BuiltStructure key={index} structure={structure} models={models} structureCategory={structure.type} />;
  });
};

const BuiltStructure = ({
  structure,
  models,
  structureCategory,
  rotation,
}: {
  structure: { col: number; row: number; type: StructureType; entityId: bigint };
  models: any;
  structureCategory: number;
  rotation?: THREE.Euler;
}) => {
  const [model, setModel] = useState(models[0].scene.clone());
  const { x, y } = getUIPositionFromColRow(structure.col, structure.row, false);
  const finishedHyperstructures = useLeaderBoardStore((state) => state.finishedHyperstructures);
  const { selectedEntity, targetEntity, setTargetEntity } = useUIStore(
    ({ selectedEntity, targetEntity, setTargetEntity }) => ({
      selectedEntity,
      targetEntity,
      setTargetEntity,
    }),
  );

  useEffect(() => {
    let category = structureCategory;
    let model = models[category];
    model.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.material = child.material.clone();
        child.material.transparent = false;
        child.material.opacity = 1;
      }
    });

    setModel(model.scene.clone());

    if (structureCategory === StructureType.Hyperstructure) {
      category = finishedHyperstructures.some((evt: HyperstructureEventInterface) => {
        return evt.hyperstructureEntityId == structure.entityId;
      })
        ? structureCategory
        : 0;
      let model = models[category];
      model.scene.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.material = child.material.clone();
          child.material.transparent = false;
          child.material.opacity = 1;
        }
      });
      setModel(model.scene.clone());
    }
  }, [models, finishedHyperstructures]);

  const scale = structureCategory === StructureType.Hyperstructure ? 1.5 : 3;

  const setTarget = () => {
    setTargetEntity(structure.entityId);
  };

  const showCombatLabel = useMemo(() => {
    return (
      selectedEntity !== undefined &&
      targetEntity !== 0n &&
      selectedEntity.position.x === structure.col &&
      selectedEntity.position.y === structure.row &&
      targetEntity === structure.entityId
    );
  }, [selectedEntity, targetEntity]);

  return (
    <group position={[x, 0.31, -y]} onClick={setTarget} rotation={rotation}>
      {showCombatLabel && <CombatLabel targetStructureEntityId={structure.entityId} />}
      <primitive dropShadow scale={scale} object={model!} />
    </group>
  );
};
