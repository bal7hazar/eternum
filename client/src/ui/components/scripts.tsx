import { useUserBattles } from "@/hooks/helpers/battles/useBattles";
import clsx from "clsx";
import { useState } from "react";
import { AddTroops } from "./scripts/add-troops";
import { Build } from "./scripts/build";
import { Contributions } from "./scripts/contributions";
import { CreateArmies } from "./scripts/create-armies";
import { Print } from "./scripts/print";
import { Show } from "./scripts/show";
import { Skip } from "./scripts/skip";
import { Transfers } from "./scripts/transfers";

export const Scripts = () => {
  const [unfolded, setUnfolded] = useState(true);

  const battles = useUserBattles();

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
        <Transfers />
        <Contributions />
      </div>
    </div>
  );
};