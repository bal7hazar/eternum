import { useDojo } from "@/hooks/context/DojoContext";
import useScriptStore, { Transfer } from "@/hooks/store/useScriptStore";
import Button from "@/ui/elements/Button";
import TextInput from "@/ui/elements/TextInput";
import { multiplyByPrecision } from "@/ui/utils/utils";
import { ResourcesIds, SendResourcesProps } from "@bibliothecadao/eternum";
import clsx from "clsx";
import { Loader, Play } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export const Transfers = () => {
    const { transfers, setTransfers, resetTransfers } = useScriptStore();
    const [isRunning, setIsRunning] = useState(false);

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
  
    const handleSend = async (calls: SendResourcesProps[]) => {
      setIsLoading(true);
      try {
        await sends_resources(calls);
      } catch (error) {
        console.error(`Failed to create armies:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (!isRunning) return;
      // Get current timestamp
      const times: { [key: number]: number } = {};
      // Create an interval that runs every 1 second
      const interval = setInterval(() => {
        const timestamp = Math.floor(new Date().getTime() / 1000);
        const calls = transfers.items
          .filter(({ start, end, every }, index) => {
            const condition = timestamp >= start && timestamp <= end && timestamp > (times[index] || 0);
            if (condition) {
              times[index] = timestamp + every;
            }
            return condition;
          })
          .map(({ from, to, resource, amount }: Transfer) => {
            const resourceId = ResourcesIds[resource as keyof typeof ResourcesIds];
            return {
              signer: account,
              sender_entity_id: BigInt(from),
              recipient_entity_id: BigInt(to),
              resources: [BigInt(resourceId), BigInt(multiplyByPrecision(amount))],
            }
          });
        if (calls.length > 0) {
          console.log(calls);
          handleSend(calls);
        }
      }, 1000);

      return () => clearInterval(interval);

    }, [isRunning]);

    return (
      <div className="flex items-center gap-x-2">
        <h4 className="text-sm min-w-20">Transfers</h4>
        <TextInput onChange={(value: string) => value ? setTransfers(JSON.parse(value)) : resetTransfers()} placeholder="All" />
        <Button
          className={clsx("text-xs h-8", hover && "opacity-50")}
          onClick={() => setIsRunning(true)}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>
    )
  };