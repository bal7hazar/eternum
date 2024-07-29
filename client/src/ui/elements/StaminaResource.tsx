import { useStamina } from "@/hooks/helpers/useStamina";
import { EternumGlobalConfig } from "@bibliothecadao/eternum";
import clsx from "clsx";

export const StaminaResource = ({ entityId, className }: { entityId: bigint | undefined; className?: string }) => {
  const { useStaminaByEntityId, getMaxStaminaByEntityId } = useStamina();
  const stamina = useStaminaByEntityId({ travelingEntityId: entityId || 0n });

  const staminaColor =
    (stamina?.amount || 0n) < EternumGlobalConfig.stamina.travelCost ? "text-red/80" : "text-yellow/80";

  return (
    <div className={`flex flex-row text-xs font-bold text-right uppercase ${className}`}>
      <div className={clsx(staminaColor, "flex", "flex-col")}>
        <div>
          STM : {stamina?.amount || 0} / {getMaxStaminaByEntityId(entityId || 0n)}
        </div>
      </div>
    </div>
  );
};
