import { currencyFormat } from "@/ui/utils/utils";
import { ResourcesIds, Troops } from "@bibliothecadao/eternum";
import { useMemo } from "react";

export const TroopRow = ({ troops, defending = false }: { troops: Troops | undefined; defending?: boolean }) => {
  const noArmy = useMemo(() => !troops, [troops]);
  return (
    <div className="self-center m-auto grid-cols-3 col-span-3 gap-2 flex">
      {/* {noArmy ? (
        <div className="text-s text-gold bg-gold/10 m-auto border border-gradient p-4">
          No defending Army!. The residents are shaking in terror.
        </div>
      ) : ( */}
      <>
        <TroopCard
          defending={defending}
          className={`${defending ? "order-last" : ""} w-1/3`}
          id={ResourcesIds.Crossbowmen}
          count={Number(troops?.crossbowman_count || 0)}
        />
        <TroopCard
          defending={defending}
          className={`w-1/3`}
          id={ResourcesIds.Paladin}
          count={Number(troops?.paladin_count || 0)}
        />
        <TroopCard
          defending={defending}
          className={`${defending ? "order-first" : ""} w-1/3`}
          id={ResourcesIds.Knight}
          count={Number(troops?.knight_count || 0)}
        />
      </>
      {/* )} */}
    </div>
  );
};

export const TroopCard = ({
  count,
  id,
  className,
  defending = false,
}: {
  count: number;
  id: ResourcesIds;
  className?: string;
  defending?: boolean;
}) => {
  return (
    <div
      className={`bg-gold/10 text-gold font-bold border-2 border-gradient p-2 clip-angled-sm hover:bg-gold/40 duration-300 ${className}`}
    >
      <img
        style={defending ? { transform: "scaleX(-1)" } : {}}
        className="h-28 object-cover mx-auto p-2"
        src={`/images/icons/${id}.png`}
        alt={ResourcesIds[id]}
      />
      <div> {ResourcesIds[id]}</div>
      <div className="text-green">x {currencyFormat(count, 0)}</div>
    </div>
  );
};
