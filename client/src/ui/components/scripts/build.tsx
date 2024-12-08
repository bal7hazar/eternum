import { getDirectionsArray } from "@/dojo/modelManager/TileManager";
import { useDojo } from "@/hooks/context/DojoContext";
import { useEntities } from "@/hooks/helpers/useEntities";
import useScriptStore from "@/hooks/store/useScriptStore";
import { BUILDINGS_CENTER } from "@/three/scenes/constants";
import Button from "@/ui/elements/Button";
import TextInput from "@/ui/elements/TextInput";
import { BuildingType } from "@bibliothecadao/eternum";
import clsx from "clsx";
import { Loader, Play } from "lucide-react";
import { useCallback, useState } from "react";
import { CairoOption, CairoOptionVariant } from "starknet";

export const Build = () => {
    const { builds, setBuilds, resetBuilds } = useScriptStore();

    const [hover, setHover] = useState(false);
    const onMouseEnter = useCallback(() => {
      setHover(true);
    }, []);
    const onMouseLeave = useCallback(() => {
      setHover(false);
    }, []);

    const {
      account: { account },
      setup: {
        systemCalls: { create_buildings },
      },
    } = useDojo();
  
    const { playerStructures } = useEntities();
    const structures = playerStructures();
  
    const [isLoading, setIsLoading] = useState(false);
  
    const handleCreateBuildings = async () => {
      setIsLoading(true);

      try {
        const entity_ids = builds.ids.length > 0 ? builds.ids : structures.filter((structure) => structure.category === 'Realm').map((structure) => structure.entity_id);

        const startingPosition: [number, number] = [BUILDINGS_CENTER[0], BUILDINGS_CENTER[1]];
        const endPosition: [number, number] = [builds.position.col, builds.position.row];
        const directions = getDirectionsArray(startingPosition, endPosition);
        const resourceType = undefined;
        const buildingType = BuildingType[builds.building as keyof typeof BuildingType];
        // { "ids": [291, 346, 294], "building": "Farm", "position": { "col": 10, "row": 9 } }

        console.log('setting buildings', entity_ids, directions, buildingType, resourceType);

        await create_buildings(
          entity_ids.map((entity_id) => {
            return {
              signer: account,
              entity_id,
              directions: directions,
              building_category: buildingType,
              produce_resource_type:
                buildingType == BuildingType.Resource && resourceType
                  ? new CairoOption<Number>(CairoOptionVariant.Some, resourceType)
                  : new CairoOption<Number>(CairoOptionVariant.None, 0),
            }
          })
        );
      } catch (error) {
        console.error(`Failed to create buildings:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex items-center gap-x-2">
        <h4 className="text-sm min-w-20">Build</h4>
        <TextInput onChange={(value: string) => value ? setBuilds(JSON.parse(value)) : resetBuilds()} placeholder="All" />
        <Button
          className={clsx("text-xs h-8", hover && "opacity-50")}
          onClick={handleCreateBuildings}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>
    )
  };