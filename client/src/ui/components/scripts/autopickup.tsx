import { ResourceInventoryManager } from "@/dojo/modelManager/ResourceInventoryManager";
import { useDojo } from "@/hooks/context/DojoContext";
import { ArrivalInfo, usePlayerArrivalsNotificationLength } from "@/hooks/helpers/use-resource-arrivals";
import useScriptStore from "@/hooks/store/useScriptStore";
import Button from "@/ui/elements/Button";
import clsx from "clsx";
import { Play, StopCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EntityReadyForDeposit } from "../trading/ResourceArrivals";

export const Autopickup = () => {
    const { autopickup, setAutopickup } = useScriptStore();

    const [hover, setHover] = useState(false);
    const onMouseEnter = useCallback(() => {
      setHover(true);
    }, []);
    const onMouseLeave = useCallback(() => {
      setHover(false);
    }, []);

    const { setup } = useDojo();
  
    const [entitiesReadyForDeposit, setEntitiesReadyForDeposit] = useState<EntityReadyForDeposit[]>([]);
    const { arrivals } = usePlayerArrivalsNotificationLength();
  
    const inventoryManager = new ResourceInventoryManager(setup, 0);
  
    const onOffload = async () => {
      await inventoryManager
        .onOffloadAllMultiple(
          entitiesReadyForDeposit
            .filter((entity) => arrivals.some((arrival: ArrivalInfo) => arrival.entityId === entity.carrierId))
            .map((entity) => ({
              senderEntityId: entity.senderEntityId,
              recipientEntityId: entity.recipientEntityId,
              resources: entity.resources,
            })),
        );
    };
  
    useEffect(() => {
      if (autopickup && entitiesReadyForDeposit.length > 0) {
        onOffload();
      }
    }, [arrivals, entitiesReadyForDeposit, autopickup]);


    return (
      <div className="flex items-center gap-x-2">
        <h4 className="text-sm min-w-20">Autopickup</h4>
        <Button
          className={clsx("text-xs h-8", hover && "opacity-50")}
          onClick={() => setAutopickup(!autopickup)}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {autopickup ? <StopCircle className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>
    )
  };