import CircleButton from "@/ui/elements/CircleButton";
import { useMemo, useState } from "react";
import { RealmListBoxes } from "@/ui/components/list/RealmListBoxes";
import { ReactComponent as Settings } from "@/assets/icons/common/settings.svg";
import { ReactComponent as Close } from "@/assets/icons/common/collapse.svg";
import useBlockchainStore from "../../../hooks/store/useBlockchainStore";
import useUIStore from "@/hooks/store/useUIStore";
import { useQuery } from "@/hooks/helpers/useQuery";
import { BuildingThumbs } from "./LeftNavigationModule";
import { useLocation } from "wouter";
import { ReactComponent as Refresh } from "@/assets/icons/common/refresh.svg";
import {
  banks,
  leaderboard,
  military,
  resources,
  trade,
  construction,
  settings,
  quests,
  guilds,
} from "../../components/navigation/Config";
import { SelectPreviewBuildingMenu } from "@/ui/components/construction/SelectPreviewBuilding";
import { useTour } from "@reactour/tour";
import { useComponentValue } from "@dojoengine/react";
import { getColRowFromUIPosition, getEntityIdFromKeys } from "@/ui/utils/utils";
import { useDojo } from "@/hooks/context/DojoContext";
import useRealmStore from "@/hooks/store/useRealmStore";
import { ArrowDown } from "lucide-react";
import { useQuests } from "@/hooks/helpers/useQuests";
import { motion } from "framer-motion";

export enum MenuEnum {
  realm = "realm",
  worldMap = "world-map",
  military = "military",
  construction = "construction",
  trade = "trade",
  resources = "resources",
  bank = "bank",
  hyperstructures = "hyperstructures",
  structures = "structures",
  leaderboard = "leaderboard",
  entityDetails = "entityDetails",
}

export const BottomNavigation = () => {
  const {
    setup: {
      components: { Population },
    },
  } = useDojo();

  const [location, setLocation] = useLocation();

  const nextBlockTimestamp = useBlockchainStore((state) => state.nextBlockTimestamp);
  const { realmEntityId } = useRealmStore();
  const togglePopup = useUIStore((state) => state.togglePopup);
  const isPopupOpen = useUIStore((state) => state.isPopupOpen);
  const toggleShowAllArmies = useUIStore((state) => state.toggleShowAllArmies);
  const showAllArmies = useUIStore((state) => state.showAllArmies);

  const population = useComponentValue(Population, getEntityIdFromKeys([BigInt(realmEntityId || "0")]));

  const { claimableQuests } = useQuests({ entityId: realmEntityId || BigInt("0") });

  const secondaryNavigation = useMemo(() => {
    return [
      {
        button: (
          <CircleButton
            tooltipLocation="top"
            active={isPopupOpen(settings)}
            image={BuildingThumbs.settings}
            label={"Settings"}
            size="lg"
            onClick={() => togglePopup(settings)}
          />
        ),
      },
      {
        button: (
          <div className="relative">
            <CircleButton
              tooltipLocation="top"
              image={BuildingThumbs.squire}
              label={quests}
              active={isPopupOpen(quests)}
              size="lg"
              onClick={() => togglePopup(quests)}
              className="forth-step"
              notification={claimableQuests.length}
            />

            {population?.population == null && location !== "/map" && (
              <div className="absolute bg-brown text-gold border-gradient border -top-12 w-32 animate-bounce px-1 py-1 flex uppercase">
                <ArrowDown className="text-gold w-4 mr-3" />
                <div>Start here</div>
              </div>
            )}
          </div>
        ),
      },
      {
        button: (
          <CircleButton
            tooltipLocation="top"
            image={BuildingThumbs.leaderboard}
            label={leaderboard}
            active={isPopupOpen(leaderboard)}
            size="lg"
            onClick={() => togglePopup(leaderboard)}
          />
        ),
      },
      {
        button: (
          <CircleButton
            tooltipLocation="top"
            image={BuildingThumbs.military}
            label={""}
            active={showAllArmies}
            size="lg"
            onClick={toggleShowAllArmies}
          />
        ),
      },
      {
        button: (
          <CircleButton
            tooltipLocation="top"
            // image={BuildingThumbs.leaderboard}
            label={guilds}
            active={isPopupOpen(guilds)}
            size="lg"
            onClick={() => togglePopup(guilds)}
          />
        ),
      },
    ];
  }, []);

  const slideUp = {
    hidden: { y: "100%" },
    visible: { y: "0%", transition: { duration: 0.3 } },
  };

  if (!nextBlockTimestamp) {
    return null;
  }

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="flex justify-center flex-wrap first-step relative w-full duration-300 transition-all"
    >
      <div className="flex py-2 sixth-step">
        {secondaryNavigation.map((a, index) => (
          <div key={index}>{a.button}</div>
        ))}
      </div>
    </motion.div>
  );
};
