import { BattleManager, BattleStatus } from "@/dojo/modelManager/BattleManager";
import { ArmyInfo } from "@/hooks/helpers/useArmies";
import { Structure } from "@/hooks/helpers/useStructures";
import useUIStore from "@/hooks/store/useUIStore";
import { soundSelector, useUiSounds } from "@/hooks/useUISound";
import { Health } from "@/types";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export const BattleProgressBar = ({
  battleManager,
  ownArmySide,
  attackingHealth,
  attackerArmies,
  defendingHealth,
  defenderArmies,
  structure,
}: {
  battleManager: BattleManager | undefined;
  ownArmySide: string;
  attackingHealth: Health | undefined;
  attackerArmies: ArmyInfo[];
  defendingHealth: Health | undefined;
  defenderArmies: (ArmyInfo | undefined)[];
  structure: Structure | undefined;
}) => {
  const currentTimestamp = useUIStore((state) => state.nextBlockTimestamp);

  const playUnitSelectedOne = useUiSounds(soundSelector.unitSelected1).play;
  const playUnitSelectedTwo = useUiSounds(soundSelector.unitSelected2).play;
  const playUnitSelectedThree = useUiSounds(soundSelector.unitSelected3).play;
  const playBattleVictory = useUiSounds(soundSelector.battleVictory).play;
  const playBattleDefeat = useUiSounds(soundSelector.battleDefeat).play;

  const durationLeft = useMemo(() => {
    if (!battleManager) return undefined;
    return battleManager!.getTimeLeft(currentTimestamp!);
  }, [attackingHealth, currentTimestamp, defendingHealth]);

  const [time, setTime] = useState<Date | undefined>(durationLeft);

  const attackerName = `${attackerArmies.length > 0 ? "Attackers" : "Empty"} ${ownArmySide === "Attack" ? "" : ""}`;
  const defenderName = structure
    ? structure.isMercenary
      ? "Bandits"
      : `${structure!.name} ${ownArmySide === "Defence" ? "(⚔️)" : ""}`
    : defenderArmies?.length > 0
      ? `Defenders ${ownArmySide === "Defence" ? "(⚔️)" : ""}`
      : "Empty";

  const totalHealth = useMemo(
    () => (attackingHealth?.current || 0n) + (defendingHealth?.current || 0n),
    [attackingHealth, defendingHealth],
  );

  const attackingHealthPercentage = useMemo(
    () =>
      totalHealth !== 0n ? ((Number(attackingHealth?.current || 0n) / Number(totalHealth)) * 100).toFixed(2) : "0",
    [attackingHealth, totalHealth],
  );
  const defendingHealthPercentage = useMemo(
    () =>
      totalHealth !== 0n ? ((Number(defendingHealth?.current || 0n) / Number(totalHealth)) * 100).toFixed(2) : "0",
    [defendingHealth, totalHealth],
  );

  useEffect(() => {
    if (!time) return;
    if (time.getTime() === 0) return;
    const timer = setInterval(() => {
      const date = new Date(0);
      date.setSeconds(time.getTime() / 1000 - 1);
      setTime(date);
    }, 1000);
    return () => clearInterval(timer);
  }, [time]);

  useEffect(() => {
    setTime(durationLeft);
  }, [durationLeft]);

  const gradient = useMemo(() => {
    const attackPercentage = parseFloat(attackingHealthPercentage);
    const defendPercentage = parseFloat(defendingHealthPercentage);
    return `linear-gradient(to right, #2B2E3E ${attackPercentage}%, #2B2E3E ${attackPercentage}%, #46201D ${attackPercentage}%, #46201D ${
      attackPercentage + defendPercentage
    }%)`;
  }, [attackingHealthPercentage, defendingHealthPercentage]);

  const battleStatus = useMemo(() => {
    if (battleManager) return battleManager.getWinner(currentTimestamp!, ownArmySide);
  }, [time, battleManager, currentTimestamp, ownArmySide]);

  useEffect(() => {
    if (battleStatus === BattleStatus.BattleStart) {
      const random = Math.random();
      if (random > 0.66) {
        playUnitSelectedOne();
      } else if (random > 0.33) {
        playUnitSelectedTwo();
      } else {
        playUnitSelectedThree();
      }
    }
    if (battleStatus === BattleStatus.UserLost) {
      playBattleDefeat();
    }
    if (battleStatus === BattleStatus.UserWon) {
      playBattleVictory();
    }
  }, [
    battleStatus,
    playUnitSelectedOne,
    playUnitSelectedTwo,
    playUnitSelectedThree,
    playBattleVictory,
    playBattleDefeat,
  ]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className=""
      variants={{
        hidden: { y: "100%" },
        visible: { y: "0%", transition: { duration: 0.5 } },
      }}
    >
      {!isNaN(Number(attackingHealthPercentage)) && !isNaN(Number(defendingHealthPercentage)) && (
        <div className="relative h-6  mx-auto w-2/3 -y rounded-t-2xl bg-opacity-40" style={{ background: gradient }}>
          <div className="flex px-4 justify-between">
            {Number(attackingHealthPercentage) > 0 && (
              <div className="text-left self-center">
                <p>{attackingHealthPercentage}%</p>
              </div>
            )}
            {Number(defendingHealthPercentage) > 0 && (
              <div className="text-left self-center">
                <p>{defendingHealthPercentage}%</p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="mx-auto w-2/3 grid grid-cols-3  text-2xl text-gold bg-[#1b1a1a] bg-hex-bg px-4 py-2  -top-y">
        <div className="text-left">
          <p>
            {attackerName} {}
          </p>
        </div>
        <div className="font-bold text-center">
          {time ? `${time.toISOString().substring(11, 19)} left` : battleStatus}
        </div>
        <div className="text-right">
          <p>{defenderName}</p>
        </div>
      </div>
    </motion.div>
  );
};
