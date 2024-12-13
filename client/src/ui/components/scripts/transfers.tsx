import { useDojo } from "@/hooks/context/DojoContext";
import useScriptStore, { Transfer } from "@/hooks/store/useScriptStore";
import Button from "@/ui/elements/Button";
import TextInput from "@/ui/elements/TextInput";
import { multiplyByPrecision } from "@/ui/utils/utils";
import { ResourcesIds } from "@bibliothecadao/eternum";
import clsx from "clsx";
import { Loader, Play } from "lucide-react";
import { useCallback, useState } from "react";

export const Transfers = () => {
    const { transfers, setTransfers, resetTransfers } = useScriptStore();

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
        systemCalls: { sends_resources },
      },
    } = useDojo();
  
    const [isLoading, setIsLoading] = useState(false);
  
    const handleSend = async () => {
      if (!transfers || transfers.items.length === 0) return;
      console.log(transfers);
      const calls = transfers.items
        .map(({ from, to, resource, amount }: Transfer) => {
          const resourceId = ResourcesIds[resource as keyof typeof ResourcesIds];
          return {
            signer: account,
            sender_entity_id: BigInt(from),
            recipient_entity_id: BigInt(to),
            resources: [BigInt(resourceId), BigInt(multiplyByPrecision(amount))],
          }
        });
      setIsLoading(true);
      try {
        await sends_resources(calls);
      } catch (error) {
        console.error(`Failed to create armies:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex items-center gap-x-2">
        <h4 className="text-sm min-w-20">Transfers</h4>
        <TextInput onChange={(value: string) => value ? setTransfers(JSON.parse(value)) : resetTransfers()} placeholder="All" />
        <Button
          className={clsx("text-xs h-8", hover && "opacity-50")}
          onClick={handleSend}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>
    )
  };