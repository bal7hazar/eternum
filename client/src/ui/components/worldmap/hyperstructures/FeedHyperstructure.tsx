import { useEffect, useMemo, useState } from "react";
import { SecondaryPopup } from "../../../elements/SecondaryPopup";
import Button from "../../../elements/Button";
import { SelectCaravanPanel } from "../../cityview/realm/trade/CreateOffer";
import useRealmStore from "../../../../hooks/store/useRealmStore";
import { getRealm } from "../../../utils/realms";
import { getComponentValue } from "@dojoengine/recs";
import { divideByPrecision, getEntityIdFromKeys, multiplyByPrecision } from "../../../utils/utils";
import { useDojo } from "../../../../hooks/context/DojoContext";
import { Steps } from "../../../elements/Steps";
import { Headline } from "../../../elements/Headline";
import { OrderIcon } from "../../../elements/OrderIcon";
import { HyperStructureInterface, orderNameDict, orders } from "@bibliothecadao/eternum";
import { ResourceCost } from "../../../elements/ResourceCost";
import clsx from "clsx";
import { Tabs } from "../../../elements/tab";
import ProgressBar from "../../../elements/ProgressBar";
import { HyperStructureCaravansPanel } from "./HyperStructureCaravans/HyperStructureCaravansPanel";
import { useCaravan } from "../../../../hooks/helpers/useCaravans";
import { NumberInput } from "../../../elements/NumberInput";
import { ReactComponent as ArrowSeparator } from "@/assets/icons/common/arrow-separator.svg";
import { WEIGHT_PER_DONKEY_KG } from "@bibliothecadao/eternum";
import useUIStore from "../../../../hooks/store/useUIStore";
import { PercentageSelection } from "../../../elements/PercentageSelection";
import { useLevel } from "../../../../hooks/helpers/useLevel";
import { getTotalResourceWeight } from "../../cityview/realm/trade/utils";
import { useCombat } from "../../../../hooks/helpers/useCombat";
import { HyperStructureRaidersPanel } from "./HyperStructureRaiders/HyperStructureRaidersPanel";
import BlurryLoadingImage from "../../../elements/BlurryLoadingImage";

type FeedHyperstructurePopupProps = {
  onClose: () => void;
  selectedHyperstructure: HyperStructureInterface;
};

export const FeedHyperstructurePopup = ({ selectedHyperstructure, onClose }: FeedHyperstructurePopupProps) => {
  const {
    account: {
      account: { address },
    },
  } = useDojo();

  const [selectedTab, setSelectedTab] = useState(0);
  const setTooltip = useUIStore((state) => state.setTooltip);

  const { useGetPositionCaravans } = useCaravan();

  const { caravans } = useGetPositionCaravans(selectedHyperstructure.position.x, selectedHyperstructure.position.y);
  const { useOwnerRaidersOnPosition, useEnemyRaidersOnPosition } = useCombat();

  const enemyRaidersIds = selectedHyperstructure
    ? useEnemyRaidersOnPosition(BigInt(address), selectedHyperstructure.position)
    : [];
  const myRaidersIds = selectedHyperstructure
    ? useOwnerRaidersOnPosition(BigInt(address), selectedHyperstructure.position)
    : [];

  const tabs = useMemo(
    () => [
      {
        key: "build",
        label: (
          <div
            onMouseEnter={() =>
              setTooltip({
                position: "bottom",
                content: (
                  <>
                    <p className="whitespace-nowrap">Initialize or feed Hyperstructure with resources.</p>
                  </>
                ),
              })
            }
            onMouseLeave={() => setTooltip(null)}
            className="flex relative group flex-col items-center"
          >
            <div>Build</div>
          </div>
        ),
        component: (
          <BuildHyperstructurePanel
            order={selectedHyperstructure.orderId}
            onSendCaravan={() => setSelectedTab(1)}
            onClose={onClose}
            hyperstructureData={selectedHyperstructure}
          />
        ),
      },
      {
        key: "caravans",
        label: (
          <div
            onMouseEnter={() =>
              setTooltip({
                position: "bottom",
                content: (
                  <>
                    <p className="whitespace-nowrap">Watch incoming caravans.</p>
                    <p className="whitespace-nowrap">Pass resources to Hyperstructure on arriving.</p>
                  </>
                ),
              })
            }
            onMouseLeave={() => setTooltip(null)}
            className="flex group relative flex-col items-center"
          >
            <div>{`Caravans (${caravans.length})`}</div>
          </div>
        ),
        component: selectedHyperstructure ? (
          <HyperStructureCaravansPanel caravans={caravans} hyperstructureData={selectedHyperstructure} />
        ) : (
          <></>
        ),
      },
      {
        key: "raides",
        label: (
          <div
            onMouseEnter={() =>
              setTooltip({
                position: "bottom",
                content: (
                  <>
                    <p className="whitespace-nowrap">Watch incoming raides.</p>
                    <p className="whitespace-nowrap">Attack or defened hyperstructure on arrival.</p>
                  </>
                ),
              })
            }
            onMouseLeave={() => setTooltip(null)}
            className="flex group relative flex-col items-center"
          >
            <div>{`Raiders (${enemyRaidersIds.length + myRaidersIds.length})`}</div>
          </div>
        ),
        component: <HyperStructureRaidersPanel enemyRaidersIds={enemyRaidersIds} myRaidersIds={myRaidersIds} />,
      },
    ],
    [selectedTab, caravans, myRaidersIds, enemyRaidersIds],
  );

  return (
    <SecondaryPopup>
      <SecondaryPopup.Head onClose={onClose}>
        <div className="flex items-center space-x-1">
          <div className="mr-0.5 bg-gray">Manage Hyperstructure:</div>
        </div>
      </SecondaryPopup.Head>
      <SecondaryPopup.Body width={"460px"}>
        <Tabs
          selectedIndex={selectedTab}
          onChange={(index: any) => setSelectedTab(index)}
          variant="default"
          className="h-full"
        >
          <Tabs.List className="!border-t-transparent">
            {tabs.map((tab, index) => (
              <Tabs.Tab key={index}>{tab.label}</Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panels className="overflow-hidden">
            {tabs.map((tab, index) => (
              <Tabs.Panel key={index}>{tab.component}</Tabs.Panel>
            ))}
          </Tabs.Panels>
        </Tabs>
      </SecondaryPopup.Body>
    </SecondaryPopup>
  );
};

type SelectableRealmProps = {
  realm: any;
  selected: boolean;
  onClick: () => void;
  costs: {
    resourceId: number;
    currentAmount: number;
    completeAmount: number;
  }[];
};

const SelectableRealm = ({ realm, selected = false, onClick, costs, ...props }: SelectableRealmProps) => {
  const costById = useMemo(() => {
    const costById: Record<string, number> = {};
    costs &&
      costs.forEach((cost: { resourceId: number; currentAmount: number; completeAmount: number }) => {
        costById[cost.resourceId] = cost.completeAmount - cost.currentAmount;
      });
    return costById;
  }, [costs]);

  const { getEntityLevel } = useLevel();

  const level = useMemo(() => {
    return getEntityLevel(realm.entity_id)?.level || 0;
  }, [realm]);

  return (
    <div
      className={clsx(
        "flex flex-col relative items-center p-2 border rounded-md text-xxs text-gray-gold",
        "border-gray-gold",
      )}
      {...props}
    >
      {realm && (
        <div className="flex absolute items-center p-1 top-0 left-0 border border-t-0 border-l-0 rounded-br-md border-gray-gold">
          {realm.order && <OrderIcon order={orderNameDict[realm.order]} size="xs" className="mr-1" />}
          {realm.name}
        </div>
      )}
      {level < 4 && <div className="text-xxs text-order-giants">Min level 4 to feed Hyperstructure</div>}
      <div className="text-gold ml-auto absolute right-2 top-2">24h:10m away</div>
      <div className="flex items-center mt-6 w-full">
        <div className="flex">
          {realm.resources &&
            realm.resources.map((resource: any) => {
              return (
                <ResourceCost
                  type="vertical"
                  withTooltip
                  key={resource.id}
                  resourceId={resource.id}
                  amount={divideByPrecision(Math.min(resource.balance, costById[resource.id]))}
                  // color={resource.balance >= costById[resource.id] ? "" : "text-order-brilliance"}
                  color={"text-order-brilliance"}
                />
              );
            })}
        </div>
        <Button disabled={level < 4} onClick={onClick} className="h-6 text-xxs ml-auto" variant="success">
          {`Send Resources`}
        </Button>
      </div>
    </div>
  );
};

const BuildHyperstructurePanel = ({
  order,
  onClose,
  onSendCaravan,
  hyperstructureData,
}: {
  order: number;
  onClose: () => void;
  onSendCaravan: () => void;
  hyperstructureData: HyperStructureInterface | undefined;
}) => {
  const [selectedCaravan, setSelectedCaravan] = useState<bigint>(0n);
  const [isNewCaravan, setIsNewCaravan] = useState(true);
  const [donkeysCount, setDonkeysCount] = useState(1);
  const [hasEnoughDonkeys, setHasEnoughDonkeys] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const {
    account: { account },
    setup: {
      systemCalls: { send_resources_to_location },
    },
  } = useDojo();
  const setTooltip = useUIStore((state) => state.setTooltip);

  const sendResourcesToHyperStructure = async () => {
    setIsLoading(true);
    if (hyperstructureData) {
      const resourcesList = Object.keys(feedResourcesGiveAmounts)
        .filter((id) => feedResourcesGiveAmounts[Number(id)] > 0)
        .flatMap((id) => [Number(id), multiplyByPrecision(feedResourcesGiveAmounts[Number(id)])]);
      if (isNewCaravan) {
        await send_resources_to_location({
          signer: account,
          sending_entity_id: realmEntityId,
          resources: resourcesList || [],
          destination_coord_x: hyperstructureData.position.x,
          destination_coord_y: hyperstructureData.position.y,
          donkeys_quantity: donkeysCount,
        });
      } else {
        // transfer resources to caravan
        await send_resources_to_location({
          signer: account,
          sending_entity_id: realmEntityId,
          resources: resourcesList || [],
          destination_coord_x: hyperstructureData.position.x,
          destination_coord_y: hyperstructureData.position.y,
          caravan_id: selectedCaravan,
        });
      }
    }
    onSendCaravan();
  };

  const {
    setup: {
      components: { Resource },
    },
  } = useDojo();

  const realmEntityIds = useRealmStore((state) => state.realmEntityIds);
  const realmEntityId = useRealmStore((state) => state.realmEntityId);
  const setRealmEntityId = useRealmStore((state) => state.setRealmEntityId);
  const [percentage, setPercentage] = useState<number>(0);
  const [feedResourcesGiveAmounts, setFeedResourcesGiveAmounts] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 0,
    13: 0,
    14: 0,
    15: 0,
    16: 0,
    17: 0,
    18: 0,
    19: 0,
    20: 0,
    21: 0,
    22: 0,
  });

  // TODO: use same precision everywhere
  const resourceWeight = useMemo(() => {
    const resourcesGive = Object.keys(feedResourcesGiveAmounts).map((resourceId) => {
      return {
        resourceId: parseInt(resourceId),
        amount: feedResourcesGiveAmounts[parseInt(resourceId)],
      };
    });
    return multiplyByPrecision(getTotalResourceWeight(resourcesGive));
  }, [hyperstructureData, feedResourcesGiveAmounts]);

  const resourcesLeftToComplete = useMemo(() => {
    const resourcesLeftToComplete: any = {};
    hyperstructureData?.hyperstructureResources.forEach((resource) => {
      resourcesLeftToComplete[resource.resourceId] =
        divideByPrecision(resource.completeAmount) - divideByPrecision(resource.currentAmount);
    });
    return resourcesLeftToComplete;
  }, [hyperstructureData]);

  const realms = useMemo(
    () =>
      realmEntityIds.map((realmEntityId) => {
        const _realm = getRealm(realmEntityId.realmId);
        const _resources = hyperstructureData?.hyperstructureResources.map((resource) => ({
          id: resource.resourceId,
          balance:
            Number(
              getComponentValue(
                Resource,
                getEntityIdFromKeys([BigInt(realmEntityId.realmEntityId), BigInt(resource.resourceId)]),
              )?.balance,
            ) || 0,
        }));
        return { ..._realm, entity_id: realmEntityId.realmEntityId, resources: _resources };
      }),
    [realmEntityIds],
  );

  const canGoToNextStep = useMemo(() => {
    if (step === 3) {
      return (selectedCaravan !== 0n || (hasEnoughDonkeys && isNewCaravan)) && resourceWeight > 0;
    } else if (step == 2) {
      return false;
    } else {
      return !(hyperstructureData?.progress === 100);
    }
  }, [step, selectedCaravan, hasEnoughDonkeys, isNewCaravan]);

  useEffect(() => {
    if (donkeysCount * WEIGHT_PER_DONKEY_KG >= divideByPrecision(resourceWeight)) {
      setHasEnoughDonkeys(true);
    } else {
      setHasEnoughDonkeys(false);
    }
  }, [donkeysCount, resourceWeight]);

  const totalResources = useMemo(() => {
    const totalResources: Record<string, number> = {};
    hyperstructureData?.hyperstructureResources.forEach((resource) => {
      let resourceAmount = getComponentValue(
        Resource,
        getEntityIdFromKeys([BigInt(realmEntityId), BigInt(resource.resourceId)]),
      );
      totalResources[resource.resourceId] = Number(resourceAmount?.balance) || 0;
    });
    return totalResources;
  }, [hyperstructureData, realmEntityId]);

  useEffect(() => {
    const feedResourcesGiveAmounts: Record<string, number> = {};
    Object.keys(totalResources).forEach((id) => {
      feedResourcesGiveAmounts[id] = Math.min(
        Math.floor(divideByPrecision((totalResources[id] * percentage) / 100)),
        resourcesLeftToComplete[id],
      );
      setFeedResourcesGiveAmounts(feedResourcesGiveAmounts);
    });
  }, [percentage]);

  return (
    <div className="flex flex-col items-center p-2">
      <div className="flex flex-col space-y-2 text-xs w-full mb-3">
        <div className="flex justify-between">
          {orders[order - 1] && (
            <div className="flex items-center">
              {<OrderIcon order={orderNameDict[order]} size="xs" className="mx-1" />}
              <span className="text-white font-bold">{orders[order - 1].fullOrderName}</span>
            </div>
          )}
          {!orders[order - 1] && (
            <div className="flex items-center">
              <span className="text-white font-bold">Not Conquered</span>
            </div>
          )}
          {/* <Leveling className="mt-2" entityId={hyperstructureData.hyperstructureId} /> */}
          <div className="flex flex-col text-xxs text-right">
            <span className="text-gray-gold italic">State</span>
            <span
              className={clsx(
                hyperstructureData && hyperstructureData?.progress >= 0 && !hyperstructureData?.completed
                  ? "text-gold"
                  : "",
              )}
            >
              {hyperstructureData?.completed
                ? "Completed"
                : `Building in progress ${hyperstructureData?.progress.toFixed(2)}%`}
            </span>
          </div>
        </div>
        <ProgressBar rounded progress={hyperstructureData?.progress || 0} className="bg-gold" />
      </div>
      {step == 1 && (
        <>
          <div className="flex flex-col space-y-2 text-xs">
            <div className="relative w-full">
              <BlurryLoadingImage
                blurhash="LBHLO~W9x.F^Atoy%2Ri~TA0Myxt"
                height="340px"
                width="100%"
                src={`/images/buildings/hyperstructure.jpg`}
                imageStyleClass="object-cover w-full h-[340px] rounded-[10px]"
              ></BlurryLoadingImage>
              <div className="flex flex-col p-2 absolute left-2 bottom-2 rounded-[10px] bg-black/60">
                <div className="mb-1 ml-1 italic text-light-pink text-xxs">Resources needed to complete:</div>
                <div className="grid grid-cols-4 gap-1">
                  {resourcesLeftToComplete &&
                    Object.keys(resourcesLeftToComplete).map((id) => (
                      <ResourceCost
                        withTooltip
                        type="vertical"
                        key={id}
                        resourceId={Number(id)}
                        amount={resourcesLeftToComplete[id]}
                      />
                    ))}
                </div>
              </div>
              <div className="flex flex-col p-2 w-[90%] absolute left-3 mx-2 top-2 rounded-[10px] bg-black/60">
                <div className="mb-1 ml-1 italic text-light-pink text-xxs">Hyperstructure Watch Tower</div>
                {hyperstructureData && (
                  <div className="flex relative justify-between text-xxs text-lightest w-full">
                    <div className="flex items-center">
                      <div className="flex items-center h-6 ">
                        <img src="/images/units/troop-icon.png" className="h-[28px]" />
                        <div className="flex ml-1 text-center">
                          <div className="bold mr-1">x{hyperstructureData.watchTowerQuantity}</div>
                          Raiders
                        </div>
                      </div>
                    </div>
                    <div className="flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center">
                      <div
                        className="flex items-center h-6 "
                        onMouseEnter={() =>
                          setTooltip({
                            position: "top",
                            content: (
                              <>
                                <p className="whitespace-nowrap">Attack power</p>
                              </>
                            ),
                          })
                        }
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <img src="/images/icons/attack.png" className="h-full" />
                        <div className="flex flex-col ml-1 text-center">
                          <div className="bold ">{hyperstructureData.attack}</div>
                        </div>
                      </div>
                      <div
                        className="flex items-center h-6 mr-2"
                        onMouseEnter={() =>
                          setTooltip({
                            position: "top",
                            content: (
                              <>
                                <p className="whitespace-nowrap">Defence power</p>
                              </>
                            ),
                          })
                        }
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <img src="/images/icons/defence.png" className="h-full" />
                        <div className="flex flex-col ml-1 text-center">
                          <div className="bold ">{hyperstructureData.defence}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-order-brilliance">
                        {hyperstructureData.health && hyperstructureData.health.toLocaleString()}
                      </div>
                      &nbsp;/ {10 * hyperstructureData.watchTowerQuantity} HP
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Headline>
              {"Feed Hyperstructure"}- Step {step}
            </Headline>
            <div className="text-xxs mb-2 italic text-gold">
              {`To level up the Hyperstructure you need to send a caravan with needed resources to the Hyperstructure location.
               You will be able to level up once all resources are sent for this level.`}
            </div>
            {/* <div className="mx-1">
              {bonusData && (
                <LevelingTable updateLevel={{ newBonus, index: newIndex }} data={bonusData}></LevelingTable>
              )}
            </div> */}
            <div className="text-xxs mb-2 italic text-white">{`Click the "Next" button to select a Realm from which you want to spend resources.`}</div>
          </div>
        </>
      )}
      {step == 2 && (
        <div className="flex flex-col w-full space-y-2">
          <Headline>Select Realm - Step {step}</Headline>
          <div className="text-xxs mb-2 italic text-gold">
            {`Press "Set the amounts" on any Realm with required resources, to set amounts and send caravan to Hyperstructure.`}
          </div>
          {hyperstructureData && (
            <div className="h-72 flex flex-col w-full space-y-2 overflow-y-scroll">
              {realms.map((realm) => (
                <SelectableRealm
                  key={realm.realmId}
                  realm={realm}
                  onClick={() => {
                    setRealmEntityId(realm.entity_id);
                    setStep(step + 1);
                  }}
                  costs={hyperstructureData?.hyperstructureResources}
                  selected={realmEntityId === realm.entity_id}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {step == 3 && (
        <>
          <>
            <div className="grid relative grid-cols-9 gap-2 max-h-[350px] overflow-auto">
              <div className={clsx("flex flex-col items-center  space-y-2 h-min", "col-span-4")}>
                <Headline className="mb-2">You Give</Headline>
                {Object.keys(resourcesLeftToComplete).map((_id) => {
                  const id: any = Number(_id);
                  return (
                    <div key={id} className="flex items-center w-full h-8">
                      <NumberInput
                        max={resourcesLeftToComplete[id]}
                        min={1}
                        value={feedResourcesGiveAmounts[id]}
                        onChange={(value) => {
                          setFeedResourcesGiveAmounts({
                            ...feedResourcesGiveAmounts,
                            [id]: Math.min(divideByPrecision(totalResources[id] || 0), value),
                          });
                        }}
                      />
                      <div className="ml-2">
                        <ResourceCost
                          className=" cursor-pointer"
                          onClick={() => {
                            setFeedResourcesGiveAmounts({
                              ...feedResourcesGiveAmounts,
                              [id]: Math.min(divideByPrecision(totalResources[id] || 0), resourcesLeftToComplete[id]),
                            });
                          }}
                          resourceId={id}
                          amount={divideByPrecision(totalResources[id] || 0)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center">
                <ArrowSeparator className="fixed top-1/2" />
              </div>
              <div className="flex flex-col col-span-4 space-y-2 h-min">
                <Headline className="mb-2">Structure needs</Headline>
                {Object.keys(resourcesLeftToComplete).map((id) => (
                  <ResourceCost
                    key={id}
                    className="!w-min h-8 cursor-pointer"
                    resourceId={Number(id)}
                    amount={resourcesLeftToComplete[id]}
                    onClick={() => {
                      setFeedResourcesGiveAmounts({
                        ...feedResourcesGiveAmounts,
                        [id]: resourcesLeftToComplete[id],
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          </>
          <PercentageSelection percentages={[0, 25, 50, 75, 100]} setPercentage={setPercentage}></PercentageSelection>
          <SelectCaravanPanel
            className="!p-0"
            donkeysCount={donkeysCount}
            setDonkeysCount={setDonkeysCount}
            isNewCaravan={isNewCaravan}
            setIsNewCaravan={setIsNewCaravan}
            selectedCaravan={selectedCaravan}
            setSelectedCaravan={setSelectedCaravan}
            selectedResourceIdsGet={[]}
            selectedResourcesGetAmounts={[]}
            selectedResourceIdsGive={[]}
            selectedResourcesGiveAmounts={[]}
            resourceWeight={resourceWeight}
            hasEnoughDonkeys={hasEnoughDonkeys}
            headline="Select Caravan - Step 3"
          />
        </>
      )}
      <div className="flex justify-between items-center mt-3 w-full text-xxs">
        <Button
          className="!px-[6px] !py-[2px] text-xxs"
          onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
          variant="outline"
        >
          {step === 1 ? "Cancel" : "Back"}
        </Button>
        <Steps className="absolute -translate-x-1/2 left-1/2 bottom-3" step={step} maxStep={3} />
        {!isLoading && (
          <Button
            className="!px-[6px] !py-[2px] text-xxs ml-auto"
            disabled={!canGoToNextStep}
            isLoading={isLoading}
            onClick={() => {
              if (step == 3) {
                sendResourcesToHyperStructure();
              } else {
                setStep(step + 1);
              }
            }}
            variant={canGoToNextStep ? "success" : "outline"}
          >
            {step == 3 ? "Send Caravan" : hyperstructureData?.progress === 100 ? "Complete" : "Next Step"}
          </Button>
        )}
        {isLoading && (
          <Button
            isLoading={true}
            onClick={() => {}}
            variant="danger"
            className="ml-auto p-2 !h-4 text-xxs !rounded-md"
          >
            {" "}
            {}{" "}
          </Button>
        )}
      </div>
    </div>
  );
};