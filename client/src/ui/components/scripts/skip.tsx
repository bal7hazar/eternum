import { useDojo } from "@/hooks/context/DojoContext";
import { useEntities } from "@/hooks/helpers/useEntities";
import { QuestStatus, useQuests } from "@/hooks/helpers/useQuests";
import useScriptStore from "@/hooks/store/useScriptStore";
import Button from "@/ui/elements/Button";
import TextInput from "@/ui/elements/TextInput";
import clsx from "clsx";
import { Loader, Play } from "lucide-react";
import { useCallback, useState } from "react";

export const Skip = () => {
    const { skips, setSkips } = useScriptStore();

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
        systemCalls: { claim_quests },
      },
    } = useDojo();
  
    const { quests } = useQuests();
  
    const { playerStructures } = useEntities();
    const structures = playerStructures();
  
    const [isLoading, setIsLoading] = useState(false);
  
    const handleClaimAllQuests = async () => {
      const unclaimedQuests = quests?.filter((quest: any) => quest.status !== QuestStatus.Claimed);
  
      setIsLoading(true);

      try {
        const quest_ids = unclaimedQuests.flatMap((quest) => quest.prizes.map((prize) => BigInt(prize.id)));
        const receiver_ids = skips.length > 0 ? skips : structures.filter((structure) => structure.category === 'Realm').map((structure) => structure.entity_id);
        await claim_quests(
          receiver_ids.map((receiver_id) => {
            return {
              signer: account,
              quest_ids,
              receiver_id,
            }
          })
        );
        localStorage.setItem("tutorial", "completed");
      } catch (error) {
        console.error(`Failed to claim resources for quests:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex items-center gap-x-2">
        <h4 className="text-sm min-w-20">Skip Quests</h4>
        <TextInput onChange={(value: string) => value ? setSkips(JSON.parse(value)) : setSkips([])} placeholder="All" />
        <Button
          className={clsx("text-xs h-8", hover && "opacity-50")}
          onClick={handleClaimAllQuests}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>
    )
  };