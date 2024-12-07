import React, { useCallback } from "react";

import ControllerConnector from "@cartridge/connector/controller";
import { ColorMode } from "@cartridge/controller";
import { mainnet, sepolia } from "@starknet-react/chains";
import { StarknetConfig, argent, jsonRpcProvider, useInjectedConnectors, voyager } from "@starknet-react/core";
import { env } from "../../../env";
import { policies } from "./policies";
import { signingPolicy } from "./signing-policy";

const theme: string = "eternum";
const slot: string = "eternum-rc1-1";
const namespace: string = "eternum";
const colorMode: ColorMode = "dark";

const controller = new ControllerConnector({
  rpc: env.VITE_PUBLIC_NODE_URL,
  namespace,
  slot,
  policies: [...policies, ...signingPolicy],
  theme,
  colorMode,
});

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    recommended: [argent()],
    includeRecommended: "onlyIfNoConnectors",
    order: "random",
  });

  const rpc = useCallback(() => {
    return { nodeUrl: env.VITE_PUBLIC_NODE_URL };
  }, []);

  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={jsonRpcProvider({ rpc })}
      // connectors={[controller as never as Connector]}
      connectors={[...connectors]}
      explorer={voyager}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
