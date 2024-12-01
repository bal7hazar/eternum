import { PassesGrid } from "@/components/modules/passes-grid";
import TransferRealmDialog, { SeasonPassMint } from "@/components/modules/transfer-realm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { seasonPassAddress } from "@/config";
import { execute } from "@/hooks/gql/execute";
import { GET_REALMS } from "@/hooks/query/realms";
import { displayAddress } from "@/lib/utils";
import { useAccount, useConnect } from "@starknet-react/core";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Badge, Loader2 } from "lucide-react";
import { Suspense, useMemo, useState } from "react";

export const Route = createLazyFileRoute("/passes")({
  component: Passes,
});

function Passes() {
  const { connectors } = useConnect();
  const { account } = useAccount();

  const [isTransferRealmOpen, setIsTransferRealmOpen] = useState(false);

  const [controllerAddress] = useState<string>();

  const { data, isLoading: isPassesLoading } = useSuspenseQuery({
    queryKey: ["erc721Balance", account?.address],
    queryFn: () => (account?.address ? execute(GET_REALMS, { accountAddress: account.address }) : null),
    refetchInterval: 10_000,
  });

  const seasonPassNfts = useMemo(
    () =>
      data?.tokenBalances?.edges?.filter(
        (token) =>
          token?.node?.tokenMetadata.__typename == "ERC721__Token" &&
          token.node.tokenMetadata.contractAddress === seasonPassAddress,
      ),
    [data, seasonPassAddress],
  );

  const loading = isPassesLoading;

  return (
    <div className="flex flex-col h-full">
      {loading && (
        <div className="flex-grow flex items-center justify-center absolute inset-0 bg-background/50 z-50">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      )}
      <>
        {controllerAddress && (
          <div className="text-xl py-4 flex items-center">
            Minting to:{" "}
            <Badge variant="secondary" className="text-lg ml-4 py-1.5">
              <img className="w-6 pr-2" src={connectors[2].icon as string} alt="Connector Icon" />
              {displayAddress(controllerAddress)}
            </Badge>
          </div>
        )}

        <>
          <div className="flex-grow overflow-y-auto p-4">
            <div className="flex flex-col gap-2">
              <Suspense fallback={<Skeleton>Loading</Skeleton>}>
                <PassesGrid seasonPasses={seasonPassNfts} />
              </Suspense>
            </div>
          </div>
          <div className="flex justify-between border-t border-gold/15 p-4 sticky bottom-0 gap-8">
            <Button onClick={() => setIsTransferRealmOpen(true)} variant="cta">
              Transfer Season Passes
            </Button>
            {seasonPassNfts && (
              <TransferRealmDialog
                isOpen={isTransferRealmOpen}
                setIsOpen={setIsTransferRealmOpen}
                seasonPassMints={seasonPassNfts as SeasonPassMint[]}
              />
            )}
          </div>
        </>
      </>
    </div>
  );
}
