import { useRpcProvider } from "@/hooks/context/DojoContext";
import { useUserBattles } from "@/hooks/helpers/battles/useBattles";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { AddTroops } from "./scripts/add-troops";
import { Build } from "./scripts/build";
import { CreateArmies } from "./scripts/create-armies";
import { Print } from "./scripts/print";
import { Show } from "./scripts/show";
import { Skip } from "./scripts/skip";

const SEASON_START_TIMESTAMP = 1733680250;

export const Scripts = () => {
  const [unfolded, setUnfolded] = useState(true);
  const [trigger, setTrigger] = useState(false);
  const provider = useRpcProvider();

  const battles = useUserBattles();

  const getTimestamp = useCallback(async () => {
    const block = await provider.getBlock();
    console.log('block', block.timestamp);
    return block.timestamp;
  }, [provider]);

  useEffect(() => {
    // Call this every 100ms and stops when trigger is true
    if (trigger) return;
    const interval = setInterval(() => {
      if (trigger) return;
      getTimestamp().then((timestamp) => {
        if (timestamp > SEASON_START_TIMESTAMP) {
          console.log('timestamp', timestamp);
          setTrigger(true);
        }
      });
    }, 500);
    return () => clearInterval(interval);
  }, [trigger, getTimestamp]);

  return (
    <div className={clsx("absolute top-0 left-1/2 -translate-x-1/2 z-[1000000] rounded-b-md overflow-hidden flex flex-col items-center p-2 gap-y-2", unfolded ? "w-[400px] bg-slate-700/70" : "w-[20px]")}>
      <div
        className="text-sm h-4 w-4 flex justify-center items-center cursor-pointer border border-yellow-500 rounded-sm"
        onClick={() => setUnfolded(!unfolded)}
      >
        {unfolded ? "-" : "+"}
      </div>
      <div className={clsx("relative text-black px-2 flex flex-col gap-y-2", unfolded ? "block" : "hidden")}>
        <div className="flex flex-col justify-end absolute top-0 right-0 gap-y-px pr-4">
          <div className="relative">
            <div className="text-xs mr-6">Start:</div>
            <div className={clsx("h-2 w-2 rounded-full animate-ping absolute top-1/4 right-0", trigger ? "bg-green" : "bg-red")} />
            <div className={clsx("h-2 w-2 rounded-full absolute top-1/4 right-0", trigger ? "bg-green" : "bg-red")} />
          </div>
          <div className="relative">
            <div className="text-xs mr-6">Battles:</div>
            <div className={clsx("h-2 w-2 rounded-full animate-ping absolute top-1/4 right-0", battles.length === 0 ? "bg-green" : "bg-red")} />
            <div className={clsx("h-2 w-2 rounded-full absolute top-1/4 right-0", battles.length === 0 ? "bg-green" : "bg-red")} />
          </div>
        </div>
        <Print />
        <Show />
        <Skip />
        <Build />
        <CreateArmies />
        <AddTroops />
      </div>
    </div>
  );
};