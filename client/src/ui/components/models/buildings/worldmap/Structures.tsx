import { Detailed, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { getUIPositionFromColRow } from "@/ui/utils/utils";
import { StructureType } from "@bibliothecadao/eternum";
import useUIStore from "@/hooks/store/useUIStore";
import { HyperstructureEventInterface } from "@/dojo/events/hyperstructureEventQueries";
import useLeaderBoardStore from "@/hooks/store/useLeaderBoardStore";
import { useControls } from "leva";
import { useFrame, useThree } from "@react-three/fiber";

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
  structure: any;
  models: any;
  structureCategory: number;
  rotation?: THREE.Euler;
}) => {
  const [model, setModel] = useState(models[0].scene.clone());
  const { x, y } = getUIPositionFromColRow(structure.col, structure.row, false);
  const finishedHyperstructures = useLeaderBoardStore((state) => state.finishedHyperstructures);

  const { camera } = useThree();

  useEffect(() => {
    let category = structureCategory;
    let model = models[category];
    model.scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.material = child.material.clone();
        child.material.transparent = false;
        child.material.opacity = 1; // Adjust opacity level as needed
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
          child.material.opacity = 1; // Adjust opacity level as needed
        }
      });
      setModel(model.scene.clone());
    }
  }, [models, finishedHyperstructures]);

  const scale = structureCategory === StructureType.Hyperstructure ? 1.5 : 3;
  const { power, lpos, color } = useControls("Structures Light", {
    power: { value: 530, min: 0, max: 1000, step: 1 },
    lpos: {
      value: {
        x: 0,
        y: 7,
        z: 0,
      },
      min: -10,
      max: 10,
      step: 0.1,
    },
    color: { value: "#fcffbc", label: "Color" },
  });

  const pLight = useRef<THREE.PointLight>(null);

  // useFrame(({ camera }) => {
  //   if (!pLight.current) return;
  //   const distance = camera.position.distanceTo(new THREE.Vector3(x, 0, -y));
  //   //pLight.current.power = Math.max(0, power * (1 - (distance - 130) / 250));
  // });

  return (
    <group position={[x, 0.31, -y]} rotation={rotation}>
      <primitive dropShadow scale={scale} object={model!} />
      <pointLight ref={pLight} distance={24} position={[lpos.x, lpos.y, lpos.z]} color={color} power={power} />
      {/* <Detailed distances={[0, 350]}>
        <group></group>
      </Detailed> */}
    </group>
  );
};