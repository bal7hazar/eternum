import { useDojo } from "@/hooks/context/DojoContext";
import { useResourceBalance } from "@/hooks/helpers/useResources";
import useScriptStore, { Transfer } from "@/hooks/store/useScriptStore";
import Button from "@/ui/elements/Button";
import TextInput from "@/ui/elements/TextInput";
import { divideByPrecision, multiplyByPrecision } from "@/ui/utils/utils";
import type * as SystemProps from "@bibliothecadao/eternum";
import { ResourcesIds } from "@bibliothecadao/eternum";
import clsx from "clsx";
import { Loader, Play } from "lucide-react";
import { useCallback, useState } from "react";

export const Contributions = () => {
    const { contributions, setContributions, resetContributions } = useScriptStore();
    const { getBalance } = useResourceBalance();

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
        systemCalls: { contributes_to_construction },
      },
    } = useDojo();
  
    const [isLoading, setIsLoading] = useState(false);
  
    const handleSend = async () => {
      if (!contributions || contributions.items.length === 0) return;
      const calls: SystemProps.ContributeToConstructionProps[] = contributions.items
        .map(({ from, to, resource, amount: fractionOrAmount }: Transfer) => {
          const resourceId = ResourcesIds[resource as keyof typeof ResourcesIds];
          const balance = divideByPrecision(getBalance(from, resourceId).balance);
          const quantity = fractionOrAmount > 100 ? fractionOrAmount : balance * fractionOrAmount / 100;
          return {
            signer: account,
            hyperstructure_entity_id: BigInt(to),
            contributor_entity_id: BigInt(from),
            contributions: [{ resource: resourceId, amount: multiplyByPrecision(quantity) }],
          }
        });
      setIsLoading(true);
      try {
        await contributes_to_construction(calls);
      } catch (error) {
        console.error(`Failed to create contributions:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex items-center gap-x-2">
        <h4 className="text-sm min-w-20">Contributions</h4>
        <TextInput onChange={(value: string) => value ? setContributions(JSON.parse(value)) : resetContributions()} placeholder="All" />
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