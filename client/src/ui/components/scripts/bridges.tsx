import { useDojo } from "@/hooks/context/DojoContext";
import { useResourceBalance } from "@/hooks/helpers/useResources";
import useScriptStore, { Transfer } from "@/hooks/store/useScriptStore";
import Button from "@/ui/elements/Button";
import TextInput from "@/ui/elements/TextInput";
import { divideByPrecision, multiplyByPrecision } from "@/ui/utils/utils";
import type * as SystemProps from "@bibliothecadao/eternum";
import { ADMIN_BANK_ENTITY_ID, ResourcesIds } from "@bibliothecadao/eternum";
import clsx from "clsx";
import { Loader, Play } from "lucide-react";
import { useCallback, useState } from "react";

const resourceAddresses = {
  1: "0x439a1c010e3e1bb2d43d43411000893c0042bd88f6c701611a0ea914d426da4",
  2: "0xce635e3f241b0ae78c46a929d84a9101910188f9c4024eaa7559556503c31a",
  3: "0x40d8907cec0f7ae9c364dfb12485a1314d84c129bf1898d2f3d4b7fcc7d44f4",
  4: "0x66ed5c928ee027a9419ace1cbea8389885161db5572a7c5c4fef2310e9bf494",
  5: "0x1720cf6318bff45e62acc588680ae3cd4d5f8465b1d52cb710533c9299b031a",
  6: "0x3b6448d09dcd023507376402686261f5d6739455fa02f804907b066e488da66",
  7: "0xdff9dca192609c4e86ab3be22c7ec1e968876c992d21986f3c542be97fa2f",
  8: "0x6fe21d2d4a8a05bdb70f09c9250af9870020d5dcc35f410b4a39d6605c3e353",
  9: "0x67ba235c569c23877064b2ac6ebd4d79f32d3c00f5fab8e28a3b5700b957f6",
  10: "0x3956a5301e99522038a2e7dcb9c2a89bf087ffa79310ee0a508b5538efd8ddd",
  11: "0x555d713e59d4ff96b7960447e9bc9e79bfdeab5b0eea74e3df81bce61cfbc77",
  12: "0x1d655ac834d38df7921074fc1588411e202b1af83307cbd996983aff52db3a8",
  13: "0x3d9b66720959d0e7687b898292c10e62e78626f2dba5e1909961a2ce3f86612",
  14: "0xe03ea8ae385f64754820af5c01c36abf1b8130dd6797d3fd9d430e4114e876",
  15: "0x5620aa7170cd66dbcbc37d03087bfe4633ffef91d3e4d97b501de906004f79b",
  16: "0x625c1f789b03ebebc7a9322366f38ebad1f693b84b2abd8cb8f5b2748b0cdd5",
  17: "0x35e24c02409c3cfe8d5646399a62c4d102bb782938d5f5180e92c9c62d3faf7",
  18: "0x4485f5a6e16562e1c761cd348e63256d00389e3ddf4f5d98afe7ab44c57c481",
  19: "0x367f838f85a2f5e1580d6f011e4476f581083314cff8721ba3dda9706076eed",
  20: "0x2f8dd022568af8f9f718aa37707a9b858529db56910633a160456838b6cbcbc",
  21: "0x68b6e23cbbd58a644700f55e96c83580921e9f521b6e5175396b53ba7910e7d",
  22: "0x3bf856515bece3c93f5061b7941b8645f817a0acab93c758b8c7b4bc0afa3c6",
  29: "0x0695b08ecdfdd828c2e6267da62f59e6d7543e690ef56a484df25c8566b332a5",
  249: "0x264be95a4a2ace20add68cb321acdccd2f9f8440ee1c7abd85da44ddab01085",
  250: "0xac965f9e67164723c16735a9da8dbc9eb8e43b1bd0323591e87c056badf606",
  251: "0x67e4ac00a241be06ba6afc11fa2715ec7da0c42c05a67ef6ecfcfeda725aaa8",
  252: "0x3bc86299bee061c7c8d7546ccb62b9daf9bffc653b1508facb722c6593874bc",
  254: "0x57a3f1ee475e072ce3be41785c0e889b7295d7a0dcc22b992c5b9408dbeb280",
  255: "0x27719173cfe10f1aa38d2aaed0a075b6077290f1e817aa3485d2b828394f4d9",
  253: "0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49"
}


export const Bridges = () => {
    const { bridges, setBridges, resetBridges } = useScriptStore();
    const { getBalance } = useResourceBalance();

    const [hover, setHover] = useState(false);
    const onMouseEnter = useCallback(() => {
      setHover(true);
    }, []);
    const onMouseLeave = useCallback(() => {
      setHover(false);
    }, []);

    const {
      account: { account },
      setup: {
        systemCalls: { bridges_start_withdraw_from_realm },
      },
    } = useDojo();
  
    const [isLoading, setIsLoading] = useState(false);
  
    const handleSend = async () => {
      if (!bridges || bridges.items.length === 0) return;
      const calls: SystemProps.BridgeStartWithdrawFromRealmProps[] = bridges.items
        .map(({ from, resource, amount: fractionOrAmount }: Transfer) => {
          const resourceId = ResourcesIds[resource as keyof typeof ResourcesIds];
          const resourceAddress = resourceAddresses[resourceId];
          const balance = divideByPrecision(getBalance(from, resourceId).balance);
          const quantity = fractionOrAmount > 100 ? fractionOrAmount : balance * fractionOrAmount / 100;
          return {
            signer: account,
            resources: [{ tokenAddress: resourceAddress, amount: multiplyByPrecision(quantity) }],
            through_bank_id: ADMIN_BANK_ENTITY_ID,
            from_realm_entity_id: from,
          }
        });
      setIsLoading(true);
      try {
        await bridges_start_withdraw_from_realm(calls);
      } catch (error) {
        console.error(`Failed to create contributions:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex items-center gap-x-2">
        <h4 className="text-sm min-w-20">Bridges</h4>
        <TextInput onChange={(value: string) => value ? setBridges(JSON.parse(value)) : resetBridges()} placeholder="All" />
        <Button
          className={clsx("text-xs h-8", hover && "opacity-50")}
          onClick={handleSend}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        </Button>
      </div>
    )
  };