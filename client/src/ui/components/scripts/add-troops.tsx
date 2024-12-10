import { useDojo } from "@/hooks/context/DojoContext";
import { formatArmies } from "@/hooks/helpers/useArmies";
import { useEntities } from "@/hooks/helpers/useEntities";
import useScriptStore from "@/hooks/store/useScriptStore";
import Button from "@/ui/elements/Button";
import TextInput from "@/ui/elements/TextInput";
import { useEntityQuery } from "@dojoengine/react";
import { Has } from "@dojoengine/recs";
import clsx from "clsx";
import { Loader, Play } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export const useArmies = () => {
  const {
    setup: {
      components: {
        Position,
        EntityOwner,
        Owner,
        Health,
        Quantity,
        Movable,
        CapacityConfig,
        Weight,
        ArrivalTime,
        Realm,
        Army,
        Protectee,
        EntityName,
        Stamina,
      },
    },
    account: { account },
  } = useDojo();

  const armies = useEntityQuery([Has(Army)]);

  const entityArmies = useMemo(() => {
    return formatArmies(
      armies,
      account.address,
      Army,
      Protectee,
      EntityName,
      Health,
      Quantity,
      Movable,
      CapacityConfig,
      Weight,
      ArrivalTime,
      Position,
      EntityOwner,
      Owner,
      Realm,
      Stamina,
    );
  }, [armies]);

  return {
    entityArmies,
  };
};

export const AddTroops = () => {
    const { troops, setTroops, resetTroops } = useScriptStore();
    const { entityArmies } = useArmies();

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
        systemCalls: { armies_buy_troops },
      },
    } = useDojo();
  
    const { playerStructures } = useEntities();
    const structures = playerStructures();
  
    const [isLoading, setIsLoading] = useState(false);

    const selecteds = useMemo(() => {
      return troops.ids.length > 0 ? troops.ids : structures.filter((structure) => structure.category === 'Realm').map((structure) => structure.entity_id);
    }, [structures, troops])

    const armies: { [key: number]: number } = useMemo(() => {
      const data: { [key: number]: number } = {};
      entityArmies.forEach((entity) => {
        const id = entity.entityOwner.entity_owner_id;
        if (!selecteds.includes(id)) return;
        data[id] = data[id] > entity.entity_id ? data[id] : entity.entity_id;
      });
      return data;
    }, [entityArmies, selecteds]);
  
    const handleClick = async () => {
      setIsLoading(true);

      try {
        const entity_ids = troops.ids.length > 0 ? troops.ids : structures.filter((structure) => structure.category === 'Realm').map((structure) => structure.entity_id);
        await armies_buy_troops(
          entity_ids.map((entity_id) => {
            return {
              signer: account,
              payer_id: entity_id,
              army_id: armies[entity_id],
              troops: {
                knight_count: BigInt(troops.troops?.knight_count || 0) * 1000n,
                crossbowman_count: BigInt(troops.troops?.crossbowman_count || 0) * 1000n,
                paladin_count: BigInt(troops.troops?.paladin_count || 0) * 1000n,
              },
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
        <h4 className="text-sm min-w-20">Add Troops</h4>
        <TextInput onChange={(value: string) => value ? setTroops(JSON.parse(value)) : resetTroops()} placeholder="All" />
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