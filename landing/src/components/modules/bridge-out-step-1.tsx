import { configManager } from "@/dojo/setup";
import { useDojo } from "@/hooks/context/DojoContext";
import { execute } from "@/hooks/gql/execute";
import { useRealm } from "@/hooks/helpers/useRealms";
import { GET_ERC_MINTS } from "@/hooks/query/realms";
import { useBridgeAsset } from "@/hooks/useBridge";
import { useTravel } from "@/hooks/useTravel";
import { displayAddress } from "@/lib/utils";
import {
  ADMIN_BANK_ENTITY_ID,
  DONKEY_ENTITY_TYPE,
  EternumGlobalConfig,
  RESOURCE_PRECISION,
  ResourcesIds,
} from "@bibliothecadao/eternum";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useMemo, useState } from "react";
import { env } from "../../../env";
import resourceAddressesLocal from "../../data/resource_addresses/local/resource_addresses.json";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { SelectSingleResource } from "../ui/SelectResources";
import { calculateDonkeysNeeded, getTotalResourceWeight } from "../ui/utils/utils";

function formatFee(fee: number) {
  return fee.toFixed(2);
}

export const BridgeOutStep1 = () => {
  const {
    account: { account },
  } = useDojo();
  const { getRealmEntityIdFromRealmId } = useRealm();
  const { computeTravelTime } = useTravel();

  const [fromToken, setFromToken] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [realm, setRealms] = useState<string>("");

  const [selectedResourceIds, setSelectedResourceIds] = useState([]);
  const [selectedResourceAmounts, setSelectedResourceAmounts] = useState<{ [key: string]: number }>({});
  const selectedResourceId = useMemo(() => selectedResourceIds[0] ?? 0, [selectedResourceIds]);
  const selectedResourceAmount = useMemo(
    () => selectedResourceAmounts[selectedResourceId] ?? 0,
    [selectedResourceAmounts, selectedResourceId],
  );

  const feeDenominator = 10000;
  const velordsFeeOnWithdrawal = useMemo(
    () =>
      formatFee(
        (EternumGlobalConfig.bridge.velords_fee_on_wtdr_percent * Number(selectedResourceAmount)) / feeDenominator,
      ),
    [selectedResourceAmount],
  );
  const seasonPoolFeeOnWithdrawal = useMemo(
    () =>
      formatFee(
        (EternumGlobalConfig.bridge.season_pool_fee_on_wtdr_percent * Number(selectedResourceAmount)) / feeDenominator,
      ),
    [selectedResourceAmount],
  );
  const clientFeeOnWithdrawal = useMemo(
    () =>
      formatFee(
        (EternumGlobalConfig.bridge.client_fee_on_wtdr_percent * Number(selectedResourceAmount)) / feeDenominator,
      ),
    [selectedResourceAmount],
  );
  const bankFeeOnWithdrawal = useMemo(
    () =>
      formatFee(
        (EternumGlobalConfig.bridge.max_bank_fee_wtdr_percent * Number(selectedResourceAmount)) / feeDenominator,
      ),
    [selectedResourceAmount],
  );
  const totalFeeOnWithdrawal = useMemo(
    () =>
      formatFee(
        Number(velordsFeeOnWithdrawal) +
          Number(seasonPoolFeeOnWithdrawal) +
          Number(clientFeeOnWithdrawal) +
          Number(bankFeeOnWithdrawal),
      ),
    [velordsFeeOnWithdrawal, seasonPoolFeeOnWithdrawal, clientFeeOnWithdrawal, bankFeeOnWithdrawal],
  );

  // const { data } = useSuspenseQuery({
  //   queryKey: ["erc721Balance", account?.address],
  //   queryFn: () => (account?.address ? execute(GET_REALMS, { accountAddress: account.address }) : null),
  //   refetchInterval: 10_000,
  // });
  const realmEntityId = useMemo(() => {
    if (!realm) {
      return 0;
    }
    return getRealmEntityIdFromRealmId(Number(realm));
  }, [realm]);
  console.log({ realmEntityId }, "firstttttttttttttytytytytytytytytytyty");
  const { data: seasonPassMints } = useSuspenseQuery({
    queryKey: ["ERCMints"],
    queryFn: () => execute(GET_ERC_MINTS),
    refetchInterval: 10_000,
  });

  const seasonPassTokens = useMemo(
    () =>
      seasonPassMints?.tokenTransfers?.edges
        ?.filter((token) => {
          const metadata = token?.node?.tokenMetadata;
          return metadata?.__typename === "ERC721__Token" && metadata.contractAddress === env.VITE_SEASON_PASS_ADDRESS;
        })
        .map((token) => {
          const metadata = token?.node?.tokenMetadata;
          if (metadata?.__typename === "ERC721__Token") {
            return {
              id: Number(metadata.tokenId),
              name_: JSON.parse(metadata.metadata).name,
            };
          }
          return undefined;
        })
        .filter((id): id is { id: number; name_: string } => id !== undefined),
    [seasonPassMints],
  );

  const travelTime = useMemo(() => {
    if (realmEntityId) {
      return computeTravelTime(
        Number(ADMIN_BANK_ENTITY_ID),
        Number(realmEntityId!),
        configManager.getSpeedConfig(DONKEY_ENTITY_TYPE),
        false,
      );
    } else {
      return 0;
    }
  }, [fromToken, realm, selectedResourceAmount]);

  // travel time is always shown in minutes so write a function
  // to convert to hours and minutes and make it look beautiful

  const travelTimeInHoursAndMinutes = (travelTime: number) => {
    const hours = Math.floor(travelTime / 60);
    const minutes = travelTime % 60;
    return `${hours}h ${minutes}m`;
  };

  // const timeToTravel = Math.floor(
  //   ((distanceFromPosition / configManager.getSpeedConfig(DONKEY_ENTITY_TYPE)) * 3600) / 60 / 60,
  // );

  const orderWeight = useMemo(() => {
    if (selectedResourceIds.length > 0) {
      console.log(selectedResourceId);
      const totalWeight = getTotalResourceWeight([{ resourceId: selectedResourceId, amount: selectedResourceAmount }]);
      console.log({ resourceId: selectedResourceId, totalWeight, amount: selectedResourceAmount });
      return totalWeight;
    } else {
      return 0;
    }
  }, [selectedResourceIds, selectedResourceAmounts]);

  const donkeysNeeded = useMemo(() => {
    if (orderWeight) {
      return calculateDonkeysNeeded(orderWeight);
    } else {
      return 0;
    }
  }, [orderWeight]);

  const { bridgeStartWithdrawFromRealm } = useBridgeAsset();

  const onSendToBank = async () => {
    if (realmEntityId) {
      const resourceAddresses = resourceAddressesLocal;
      const selectedResourceName = ResourcesIds[selectedResourceId];
      console.log({ selectedResourceName, realmEntityId });
      let tokenAddress = resourceAddresses[selectedResourceName.toUpperCase()][1];
      try {
        setIsLoading(true);
        await bridgeStartWithdrawFromRealm(
          tokenAddress,
          ADMIN_BANK_ENTITY_ID,
          BigInt(realmEntityId!),
          BigInt(selectedResourceAmount * RESOURCE_PRECISION),
        );
        // setselectedResourceAmount("");
        // setFromToken("");
        // setRealm("");
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error("\n\n\n\n Realm does not exist in game yet. settle the realm!\n\n\n\n");
    }
  };

  return (
    <div className="w-96 flex flex-col gap-3">
      <div className="flex justify-between">
        <div>From Wallet</div>

        <div>{displayAddress(account?.address)}</div>
      </div>
      <Select onValueChange={(value) => setRealms(value)}>
        <SelectTrigger className="w-full border-gold/15">
          <SelectValue placeholder="Select Realm" />
        </SelectTrigger>
        <SelectContent>
          {seasonPassTokens?.map((token) => (
            <SelectItem key={token.id} value={token.id.toString()}>
              {token.name_} {token.id} {!getRealmEntityIdFromRealmId(token.id) && <span>(NOT IN GAME)</span>}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {Boolean(realmEntityId) && (
        <SwapRow
          realmEntityId={Number(realmEntityId)}
          selectedResourceIds={selectedResourceIds}
          setSelectedResourceIds={setSelectedResourceIds}
          selectedResourceAmounts={selectedResourceAmounts}
          setSelectedResourceAmounts={setSelectedResourceAmounts}
        />
      )}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <div>Arrives in Bank</div>
          <div>{travelTimeInHoursAndMinutes(travelTime ?? 0)}</div>
        </div>
        <div className="flex justify-between">
          <div>Donkeys Needed</div>
          <div>{donkeysNeeded}</div>
        </div>
        <hr />
        <div className="flex justify-between font-bold">
          <div>Total Transfer Fee</div>
          <div>{totalFeeOnWithdrawal}</div>
        </div>
        <div className="flex justify-between text-xs">
          <div>Bank Fees ({(EternumGlobalConfig.bridge.max_bank_fee_wtdr_percent * 100) / feeDenominator}%)</div>
          <div>{bankFeeOnWithdrawal}</div>
        </div>
        <div className="flex justify-between text-xs">
          <div>Velords Fees ({(EternumGlobalConfig.bridge.velords_fee_on_wtdr_percent * 100) / feeDenominator}%)</div>
          <div>{velordsFeeOnWithdrawal}</div>
        </div>
        <div className="flex justify-between text-xs">
          <div>
            Season Pool Fees ({(EternumGlobalConfig.bridge.season_pool_fee_on_wtdr_percent * 100) / feeDenominator}%)
          </div>
          <div>{seasonPoolFeeOnWithdrawal}</div>
        </div>
        <div className="flex justify-between text-xs">
          <div>Client Fees ({(EternumGlobalConfig.bridge.client_fee_on_wtdr_percent * 100) / feeDenominator}%)</div>
          <div>{clientFeeOnWithdrawal}</div>
        </div>
        <div className="flex justify-between font-bold mt-5 mb-5">
          <div>Total Amount Received</div>
          <div>{formatFee(Number(selectedResourceAmount) - Number(totalFeeOnWithdrawal))}</div>
        </div>
      </div>
      <Button disabled={(!selectedResourceAmount && !fromToken && !realm) || isLoading} onClick={() => onSendToBank()}>
        {isLoading && <Loader className="animate-spin pr-2" />}
        {isLoading ? "Sending to Bank..." : "Send to Bank (Step 1)"}
      </Button>
    </div>
  );
};

export const SwapRow = ({
  realmEntityId,
  selectedResourceIds,
  setSelectedResourceIds,
  selectedResourceAmounts,
  setSelectedResourceAmounts,
}: {
  realmEntityId: number;
  selectedResourceIds: number[];
  setSelectedResourceIds: (value: number[]) => void;
  selectedResourceAmounts: { [key: string]: number };
  setSelectedResourceAmounts: (value: { [key: string]: number }) => void;
}) => {
  console.log(selectedResourceIds, selectedResourceAmounts);
  return (
    // <div className="rounded-lg p-3 border border-gold/15 shadow-lg bg-dark-brown flex gap-3">

    <div className="grid grid-cols-0 gap-8 px-8 h-full">
      <div className=" bg-gold/10  h-auto border border-gold/40">
        <SelectSingleResource
          selectedResourceIds={selectedResourceIds}
          setSelectedResourceIds={setSelectedResourceIds}
          selectedResourceAmounts={selectedResourceAmounts}
          setSelectedResourceAmounts={setSelectedResourceAmounts}
          entity_id={realmEntityId}
        />
      </div>
    </div>
  );
};
