import { useDojo } from "@/hooks/context/DojoContext";
import useScriptStore, { Transfer } from "@/hooks/store/useScriptStore";
import Button from "@/ui/elements/Button";
import TextInput from "@/ui/elements/TextInput";
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
        systemCalls: { transfers_resources },
      },
    } = useDojo();
  
    const [isLoading, setIsLoading] = useState(false);
  
    const handleClick = async () => {
      setIsLoading(true);

      try {
        await transfers_resources(transfers.items.map(({ from, to, amount }: Transfer) => { 
          return {
            signer: account,
            sending_entity_id: BigInt(from),
            receiving_entity_id: BigInt(to),
            resources: [1n, BigInt(amount), 2n, BigInt(amount)],
          }
        }));
      } catch (error) {
        console.error(`Failed to create armies:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex items-center gap-x-2">
        <h4 className="text-sm min-w-20">Create Armies</h4>
        <TextInput onChange={(value: string) => value ? setTransfers(JSON.parse(value)) : resetTransfers()} placeholder="All" />
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