import { configManager } from "@/dojo/setup";
import { useEntities } from "@/hooks/helpers/useEntities";
import { useRealm } from "@/hooks/helpers/useRealms";
import { useBridgeAsset } from "@/hooks/useBridge";
import { useTravel } from "@/hooks/useTravel";
import { displayAddress } from "@/lib/utils";
import {
  ADMIN_BANK_ENTITY_ID,
  BRIDGE_FEE_DENOMINATOR,
  DONKEY_ENTITY_TYPE,
  EternumGlobalConfig,
  ResourcesIds,
} from "@bibliothecadao/eternum";
import { useAccount } from "@starknet-react/core";
import { Loader, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { calculateDonkeysNeeded, getSeasonAddresses, getTotalResourceWeight } from "../ui/utils/utils";

function formatFee(fee: number) {
  return fee.toFixed(2);
}

interface ResourceSelection {
  id: number;
  amount: string;
  contract: string;
}

export const BridgeIn = () => {
  const { address } = useAccount();
  const [realmEntityId, setRealmEntityId] = useState<number>();

  const { computeTravelTime } = useTravel();
  const { getRealmNameById } = useRealm();
  const [isLoading, setIsLoading] = useState(false);
  const [resourceSelections, setResourceSelections] = useState<ResourceSelection[]>([
    { id: 0, amount: "", contract: "" }
  ]);

  const handleResourceChange = (id: number, field: 'amount' | 'contract', value: string) => {
    setResourceSelections(prev => 
      prev.map(selection => 
        selection.id === id ? { ...selection, [field]: value } : selection
      )
    );
  };

  const handleResourceRemove = (id: number) => {
    setResourceSelections(prev => prev.filter(selection => selection.id !== id));
  };

  const addResourceSelection = () => {
    setResourceSelections(prev => [
      ...prev, 
      { id: prev.length, amount: "", contract: "" }
    ]);
  };

  const bridgeConfig = EternumGlobalConfig.bridge;

  const calculateBridgeFee = (percent: number) => {
    return (percent * Number(resourceSelections[0].amount)) / BRIDGE_FEE_DENOMINATOR;
  };

  const calculateBridgeFeeDisplayPercent = (percent: number) => {
    return (percent * 100) / BRIDGE_FEE_DENOMINATOR;
  };

  const velordsFeeOnDeposit = useMemo(
    () => formatFee(calculateBridgeFee(bridgeConfig.velords_fee_on_dpt_percent)),
    [resourceSelections],
  );
  const seasonPoolFeeOnDeposit = useMemo(
    () => formatFee(calculateBridgeFee(bridgeConfig.season_pool_fee_on_dpt_percent)),
    [resourceSelections],
  );
  const clientFeeOnDeposit = useMemo(
    () => formatFee(calculateBridgeFee(bridgeConfig.client_fee_on_dpt_percent)),
    [resourceSelections],
  );
  const bankFeeOnDeposit = useMemo(
    () => formatFee(calculateBridgeFee(bridgeConfig.max_bank_fee_dpt_percent)),
    [resourceSelections],
  );

  const totalFeeOnDeposit = useMemo(
    () =>
      formatFee(
        Number(velordsFeeOnDeposit) +
          Number(seasonPoolFeeOnDeposit) +
          Number(clientFeeOnDeposit) +
          Number(bankFeeOnDeposit),
      ),
    [velordsFeeOnDeposit, seasonPoolFeeOnDeposit, clientFeeOnDeposit, bankFeeOnDeposit],
  );

  const { playerRealms } = useEntities();
  const playerRealmsIdAndName = useMemo(() => {
    return playerRealms.map((realm) => ({
      realmId: realm!.realm_id,
      entityId: realm!.entity_id,
      name: getRealmNameById(realm!.realm_id),
    }));
  }, [playerRealms]);

  const travelTime = useMemo(() => {
    if (realmEntityId) {
      return computeTravelTime(
        Number(ADMIN_BANK_ENTITY_ID),
        Number(realmEntityId!),
        configManager.getSpeedConfig(DONKEY_ENTITY_TYPE),
        true,
      );
    } else {
      return 0;
    }
  }, [computeTravelTime, realmEntityId]);

  const travelTimeInHoursAndMinutes = (travelTime: number) => {
    const hours = Math.floor(travelTime / 60);
    const minutes = travelTime % 60;
    return `${hours}h ${minutes}m`;
  };

  const orderWeight = useMemo(() => {
    if (resourceSelections[0].contract && resourceSelections[0].amount) {
      const totalWeight = getTotalResourceWeight([
        {
          resourceId: ResourcesIds[resourceSelections[0].contract as keyof typeof ResourcesIds],
          amount: Number(resourceSelections[0].amount),
        },
      ]);
      return totalWeight;
    } else {
      return 0;
    }
  }, [resourceSelections]);

  const donkeysNeeded = useMemo(() => {
    if (orderWeight) {
      return calculateDonkeysNeeded(orderWeight);
    } else {
      return 0;
    }
  }, [orderWeight]);

  const { bridgeIntoRealm } = useBridgeAsset();

  const onBridgeIntoRealm = async () => {
    try {
      setIsLoading(true);
      
      // Filter out invalid selections and map to required format
      const validResources = await Promise.all(
        resourceSelections
          .filter(selection => selection.contract && selection.amount)
          .map(async selection => {
            const resourceAddresses = await getSeasonAddresses();
            const tokenAddress = resourceAddresses[selection.contract.toLocaleUpperCase() as keyof typeof resourceAddresses][1];
            return {
              tokenAddress: tokenAddress as string,
              amount: BigInt((selection.amount as unknown as number) * 10 ** 18),
            };
          })
      );

      if (validResources.length === 0) {
        throw new Error("No valid resources selected");
      }

      await bridgeIntoRealm(
        validResources,
        ADMIN_BANK_ENTITY_ID,
        BigInt(realmEntityId!),
      );
    } catch (error) {
      console.error("Bridge into realm error:", error);
      toast.error("Failed to transfer resources");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-96 flex flex-col gap-3">
      <div className="flex justify-between">
        <div>From Wallet</div>

        <div>{displayAddress(address || "")}</div>
      </div>
      <Select onValueChange={(value) => setRealmEntityId(Number(value))}>
        <SelectTrigger className="w-full border-gold/15">
          <SelectValue placeholder="Select Realm To Transfer" />
        </SelectTrigger>
        <SelectContent>
          {playerRealmsIdAndName.length ? playerRealmsIdAndName.map((realm) => {
            return (
              <SelectItem key={realm.realmId} value={realm.entityId.toString()}>
                #{realm.realmId} - {realm.name}
              </SelectItem>
            );
          }) : "No Realms settled in Eternum"}
        </SelectContent>
      </Select>

      {resourceSelections.map((selection) => (
        <SelectResourceToBridge
          key={selection.id}
          selectedResourceAmount={selection.amount}
          setselectedResourceAmount={(value) => handleResourceChange(selection.id, 'amount', value ?? 0)}
          setselectedResourceContract={(value) => handleResourceChange(selection.id, 'contract', value)}
          onRemove={() => handleResourceRemove(selection.id)}
          showRemove={resourceSelections.length > 1}
        />
      ))}

      <Button 
        variant="outline" 
        size="sm" 
        onClick={addResourceSelection}
        className="mb-2"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Resource
      </Button>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <div>Time to Transfer</div>
          <div>{travelTimeInHoursAndMinutes(travelTime ?? 0)}</div>
        </div>
        <div className="flex justify-between">
          <div>Donkeys Needed</div>
          <div>{donkeysNeeded}</div>
        </div>
        <hr />
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button className="w-full flex justify-between font-bold px-0" variant={"ghost"}>
              <div className="flex items-center">
                <Plus className="mr-4" />
                Total Transfer Fee
              </div>
              <div>{totalFeeOnDeposit}</div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <div>Bank Fees ({calculateBridgeFeeDisplayPercent(bridgeConfig.max_bank_fee_dpt_percent)}%)</div>
              <div>{bankFeeOnDeposit}</div>
            </div>
            <div className="flex justify-between text-xs">
              <div>Velords Fees ({calculateBridgeFeeDisplayPercent(bridgeConfig.velords_fee_on_dpt_percent)}%)</div>
              <div>{velordsFeeOnDeposit}</div>
            </div>
            <div className="flex justify-between text-xs">
              <div>
                Season Pool Fees ({calculateBridgeFeeDisplayPercent(bridgeConfig.season_pool_fee_on_dpt_percent)}%)
              </div>
              <div>{seasonPoolFeeOnDeposit}</div>
            </div>
            <div className="flex justify-between text-xs">
              <div>Client Fees ({calculateBridgeFeeDisplayPercent(bridgeConfig.client_fee_on_dpt_percent)}%)</div>
              <div>{clientFeeOnDeposit}</div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <div className="flex justify-between font-bold mt-5 mb-5">
          <div>Total Amount Received</div>
          <div>{formatFee(Number(resourceSelections[0].amount) - Number(totalFeeOnDeposit))}</div>
        </div>
      </div>
      <Button
        disabled={(resourceSelections[0].amount === "" || !resourceSelections[0].contract) || isLoading || !realmEntityId}
        onClick={() => onBridgeIntoRealm()}
      >
        {isLoading && <Loader className="animate-spin pr-2" />}
        {isLoading ? "Transferring..." : "Initiate Transfer"}
      </Button>
    </div>
  );
};

export const SelectResourceToBridge = ({
  selectedResourceAmount,
  setselectedResourceAmount,
  setselectedResourceContract,
  onRemove,
  showRemove,
}: {
  selectedResourceAmount: string;
  setselectedResourceAmount: (value: string) => void;
  setselectedResourceContract: (value: string) => void;
  onRemove: () => void;
  showRemove: boolean;
}) => {
  return (
    <div className="rounded-lg p-3 border border-gold/15 shadow-lg bg-dark-brown flex gap-3 items-center">
      <Input
        type="text"
        placeholder="0.0"
        value={selectedResourceAmount}
        onChange={(e) => setselectedResourceAmount(e.target.value)}
        className="bg-dark-brown text-2xl w-full outline-none h-10 border-none"
      />

      <Select onValueChange={(value) => setselectedResourceContract(value)}>
        <SelectTrigger className="w-[180px] border-gold/15">
          <SelectValue placeholder="Select Resource" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ResourcesIds)
            .filter((resource) => isNaN(Number(resource)))
            .map((resource) => (
              <SelectItem key={resource} value={resource.toString()}>
                {resource}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      
      {showRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-red-500 hover:text-red-600"
        >
          ×
        </Button>
      )}
    </div>
  );
};
