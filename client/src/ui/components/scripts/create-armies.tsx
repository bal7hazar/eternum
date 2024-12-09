import { useDojo } from "@/hooks/context/DojoContext";
import { useEntities } from "@/hooks/helpers/useEntities";
import useScriptStore from "@/hooks/store/useScriptStore";
import Button from "@/ui/elements/Button";
import TextInput from "@/ui/elements/TextInput";
import clsx from "clsx";
import { Loader, Play } from "lucide-react";
import { useCallback, useState } from "react";

export const CreateArmies = () => {
    const { armies, setArmies, resetArmies } = useScriptStore();

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
        systemCalls: { create_armies },
      },
    } = useDojo();
  
    const { playerStructures } = useEntities();
    const structures = playerStructures();
  
    const [isLoading, setIsLoading] = useState(false);
  
    const handleClick = async () => {
      setIsLoading(true);

      try {
        const entity_ids = armies.ids.length > 0 ? armies.ids : structures.filter((structure) => structure.category === 'Realm').map((structure) => structure.entity_id);

        await create_armies(
          entity_ids.map((entity_id) => {
            return {
              signer: account,
              army_owner_id: entity_id,
              is_defensive_army: armies.isDefensive,
            }
          })
        );
      } catch (error) {
        console.error(`Failed to create armies:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex items-center gap-x-2">
        <h4 className="text-sm min-w-20">Create Armies</h4>
        <TextInput onChange={(value: string) => value ? setArmies(JSON.parse(value)) : resetArmies()} placeholder="All" />
        <Button
          className={clsx("text-xs h-8", hover && "opacity-50")}
          onClick={handleClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>
    )
  };