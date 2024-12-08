import clsx from "clsx";
import { useState } from "react";
import { Show } from "./scripts/show";
import { Skip } from "./scripts/skip";

export const Scripts = () => {
  const [unfolded, setUnfolded] = useState(true);

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-700/70 z-[1000000] rounded-b-md overflow-hidden flex flex-col items-center p-2 w-[400px] gap-y-2">
      <div
        className="text-sm h-4 w-4 flex justify-center items-center cursor-pointer border border-yellow-500 rounded-sm"
        onClick={() => setUnfolded(!unfolded)}
      >
        {unfolded ? "-" : "+"}
      </div>
      <div className={clsx("text-black px-2 flex flex-col gap-y-2", unfolded ? "block" : "hidden")}>
        <Show />
        <Skip />
      </div>
    </div>
  );
};