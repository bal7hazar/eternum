import { getEntitiesUtils } from "@/hooks/helpers/useEntities";
import { useQuery } from "@/hooks/helpers/useQuery";
import { useQuestClaimStatus } from "@/hooks/helpers/useQuests";
import { useQuestStore } from "@/hooks/store/useQuestStore";
import useUIStore from "@/hooks/store/useUIStore";
import { SelectPreviewBuildingMenu } from "@/ui/components/construction/SelectPreviewBuilding";
import { QuestId } from "@/ui/components/quest/questDetails";
import { StructureConstructionMenu } from "@/ui/components/structures/construction/StructureConstructionMenu";
import { BaseContainer } from "@/ui/containers/BaseContainer";
import clsx from "clsx";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import { useMemo, useState } from "react";
import { construction, military, quests as questsPopup, worldStructures } from "../../components/navigation/Config";
import CircleButton from "../../elements/CircleButton";
import { EntityDetails } from "../entity-details/EntityDetails";
import { Military } from "../military/Military";
import { WorldStructuresMenu } from "../world-structures/WorldStructuresMenu";

export enum MenuEnum {
  military = "military",
  construction = "construction",
  worldStructures = "worldStructures",
  entityDetails = "entityDetails",
}

export const BuildingThumbs = {
  hex: "/images/buildings/thumb/question.png",
  military: "/images/buildings/thumb/sword.png",
  construction: "/images/buildings/thumb/crane.png",
  trade: "/images/buildings/thumb/trade.png",
  resources: "/images/buildings/thumb/resources.png",
  banks: "/images/buildings/thumb/banks.png",
  worldStructures: "/images/buildings/thumb/world-map.png",
  leaderboard: "/images/buildings/thumb/leaderboard.png",
  worldMap: "/images/buildings/thumb/world-map.png",
  squire: "/images/buildings/thumb/squire.png",
  question: "/images/buildings/thumb/question-wood.png",
  scale: "/images/buildings/thumb/scale.png",
  settings: "/images/buildings/thumb/settings.png",
  guild: "/images/buildings/thumb/guilds.png",
};

export enum View {
  None,
  MilitaryView,
  EntityView,
  ConstructionView,
  WorldStructuresView,
}

export const LeftNavigationModule = () => {
  const [lastView, setLastView] = useState<View>(View.EntityView);

  const view = useUIStore((state) => state.leftNavigationView);
  const setView = useUIStore((state) => state.setLeftNavigationView);
  const previewBuilding = useUIStore((state) => state.previewBuilding);
  const isPopupOpen = useUIStore((state) => state.isPopupOpen);
  const openedPopups = useUIStore((state) => state.openedPopups);

  const selectedQuest = useQuestStore((state) => state.selectedQuest);

  const structureEntityId = useUIStore((state) => state.structureEntityId);

  const { questClaimStatus } = useQuestClaimStatus();

  const { isMapView } = useQuery();

  const isBuildQuest = useMemo(() => {
    return (
      selectedQuest?.id === QuestId.BuildFarm ||
      selectedQuest?.id === QuestId.BuildResource ||
      selectedQuest?.id === QuestId.BuildWorkersHut ||
      selectedQuest?.id === QuestId.Market ||
      (selectedQuest?.id === QuestId.Hyperstructure && isMapView)
    );
  }, [selectedQuest, isMapView]);
  const { getEntityInfo } = getEntitiesUtils();
  const structureIsMine = getEntityInfo(structureEntityId).isMine;

  const navigation = useMemo(() => {
    const navigation = [
      {
        name: "entityDetails",
        button: (
          <CircleButton
            image={BuildingThumbs.hex}
            tooltipLocation="top"
            label={"Details"}
            active={view === View.EntityView}
            size="xl"
            onClick={() => {
              if (view === View.EntityView) {
                setView(View.None);
              } else {
                setLastView(View.EntityView);
                setView(View.EntityView);
              }
            }}
          />
        ),
      },
      {
        name: "military",
        button: (
          <CircleButton
            disabled={!structureIsMine}
            className={clsx({
              "animate-pulse":
                view != View.ConstructionView && selectedQuest?.id === QuestId.CreateArmy && isPopupOpen(questsPopup),
              hidden: !questClaimStatus[QuestId.CreateTrade],
            })}
            image={BuildingThumbs.military}
            tooltipLocation="top"
            label={military}
            active={view === View.MilitaryView}
            size="xl"
            onClick={() => {
              if (view === View.MilitaryView) {
                setView(View.None);
              } else {
                setLastView(View.MilitaryView);
                setView(View.MilitaryView);
              }
            }}
          />
        ),
      },
      {
        name: "construction",
        button: (
          <CircleButton
            disabled={!structureIsMine}
            className={clsx({
              "animate-pulse": view != View.ConstructionView && isBuildQuest && isPopupOpen(questsPopup),
              hidden: !questClaimStatus[QuestId.Settle],
            })}
            image={BuildingThumbs.construction}
            tooltipLocation="top"
            label={construction}
            active={view === View.ConstructionView}
            size="xl"
            onClick={() => {
              if (view === View.ConstructionView) {
                setView(View.None);
              } else {
                setLastView(View.ConstructionView);
                setView(View.ConstructionView);
              }
            }}
          />
        ),
      },
      {
        name: "worldStructures",
        button: (
          <CircleButton
            disabled={!structureIsMine}
            className={clsx({
              hidden: !questClaimStatus[QuestId.CreateArmy],
              "animate-pulse":
                view != View.ConstructionView && selectedQuest?.id === QuestId.Contribution && isPopupOpen(questsPopup),
            })}
            image={BuildingThumbs.worldStructures}
            tooltipLocation="top"
            label={worldStructures}
            active={view === View.WorldStructuresView}
            size="xl"
            onClick={() => {
              if (view === View.WorldStructuresView) {
                setView(View.None);
              } else {
                setLastView(View.WorldStructuresView);
                setView(View.WorldStructuresView);
              }
            }}
          />
        ),
      },
    ];

    return isMapView
      ? navigation.filter(
          (item) =>
            item.name === MenuEnum.entityDetails ||
            item.name === MenuEnum.military ||
            item.name === MenuEnum.construction ||
            item.name === MenuEnum.worldStructures,
        )
      : navigation.filter(
          (item) =>
            item.name === MenuEnum.entityDetails ||
            item.name === MenuEnum.military ||
            item.name === MenuEnum.construction ||
            item.name === MenuEnum.worldStructures,
        );
  }, [location, view, openedPopups, selectedQuest, questClaimStatus, structureEntityId]);

  // Open & close panel automatically when building
  const debouncedSetIsOffscreen = debounce(() => {
    if (previewBuilding != null) {
      setView(View.None);
    }
  }, 500);

  const slideLeft = {
    hidden: { x: "-100%" },
    visible: { x: "0%", transition: { duration: 0.5 } },
  };

  return (
    <>
      <div
        className={`max-h-full transition-all duration-200 space-x-1 gap-1 flex z-0 w-[600px] text-gold left-10 self-center pointer-events-none ${
          isOffscreen(view) ? "-translate-x-[88%]" : ""
        }`}
        onPointerEnter={() => {
          debouncedSetIsOffscreen.cancel();
          if (view === View.None && lastView === View.None && previewBuilding != null) {
            const newView = View.ConstructionView;
            setView(newView);
            setLastView(newView);
          } else if (view === View.None && previewBuilding != null) {
            setView(lastView);
          }
        }}
        onPointerLeave={debouncedSetIsOffscreen}
      >
        <BaseContainer
          className={`w-full pointer-events-auto overflow-y-auto ${isOffscreen(view) ? "h-[20vh]" : "h-[60vh]"}`}
        >
          {view === View.EntityView && <EntityDetails />}
          {view === View.MilitaryView && <Military entityId={structureEntityId} />}
          {!isMapView && view === View.ConstructionView && <SelectPreviewBuildingMenu />}
          {isMapView && view === View.ConstructionView && <StructureConstructionMenu />}
          {view === View.WorldStructuresView && <WorldStructuresMenu />}
        </BaseContainer>
        <motion.div
          variants={slideLeft}
          initial="hidden"
          animate="visible"
          className="gap-2 flex flex-col justify-center self-center pointer-events-auto"
        >
          <div className="flex flex-col gap-2 mb-auto">
            <div className="flex flex-col space-y-2 py-2">
              {navigation.map((a, index) => (
                <div key={index}>{a.button}</div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

const isOffscreen = (view: View) => {
  return view === View.None;
};
