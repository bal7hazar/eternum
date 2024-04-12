import { useGLTF } from "@react-three/drei";
import useUIStore from "../../../hooks/store/useUIStore";
import GroundGrid, { isHexOccupied } from "./GroundGrid";
import * as THREE from "three";
import { getUIPositionFromColRow } from "../../utils/utils";
import { useEffect, useMemo, useState } from "react";
import { createHexagonShape } from "../worldmap/hexagon/HexagonGeometry";
import { HEX_RADIUS } from "../worldmap/hexagon/WorldHexagon";
import { ExistingBuildings } from "./ExistingBuildings";

const BuildArea = () => {
  return (
    <group>
      <BuildingPreview />
      <ExistingBuildings />
      <GroundGrid />
    </group>
  );
};

export default BuildArea;

const BuildingPreview = () => {
  const previewBuilding = useUIStore((state) => state.previewBuilding);
  const hoveredBuildHex = useUIStore((state) => state.hoveredBuildHex);
  const existingBuildings = useUIStore((state) => state.existingBuildings);

  const previewCoords = useMemo(() => {
    return getUIPositionFromColRow(hoveredBuildHex.col, hoveredBuildHex.row, true);
  }, [hoveredBuildHex]);

  const originalModels = useGLTF([
    "/models/buildings/castle.glb",
    "/models/buildings/mine.glb",
    "/models/buildings/farm.glb",
    "/models/buildings/fishery.glb",
    "/models/buildings/barracks.glb",
    "/models/buildings/market.glb",
    "/models/buildings/archer_range.glb",
    "/models/buildings/stable.glb",
  ]);

  // Clone all models for manipulation
  const models = useMemo(() => originalModels.map((model) => model.scene.clone()), [originalModels]);

  const [color, setColor] = useState(new THREE.Color("red"));

  useEffect(() => {
    if (!previewBuilding) return;
    const newColor = isHexOccupied(hoveredBuildHex.col, hoveredBuildHex.row, existingBuildings) ? "red" : "green";
    setColor(new THREE.Color(newColor));
    models[previewBuilding - 1].traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.material = node.material.clone();
        node.material.color.set(newColor);
        node.material.transparent = true;
        node.material.opacity = 0.5;
      }
    });
  }, [previewBuilding, hoveredBuildHex, existingBuildings, models]);

  const previewModel = useMemo(() => {
    if (!previewBuilding) return null;
    return models[previewBuilding - 1];
  }, [previewBuilding, models]);

  const hexagonGeometry = useMemo(() => new THREE.ShapeGeometry(createHexagonShape(HEX_RADIUS)), []);

  return previewModel ? (
    <group position={[previewCoords.x, 2.33, -previewCoords.y]}>
      <primitive scale={3} object={previewModel} />
      <mesh rotation={[-0.5 * Math.PI, 0, 0]} geometry={hexagonGeometry}>
        <meshMatcapMaterial attach="material" color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  ) : null;
};