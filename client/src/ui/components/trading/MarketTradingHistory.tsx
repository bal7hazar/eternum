import { MarketInterface } from "@bibliothecadao/eternum";
import { OrderRow, OrderRowHeader } from "./MarketOrderPanel";

interface MarketTradingHistoryProps {
  userTrades: MarketInterface[];
  userTradingHistory: MarketInterface[];
  entityId: bigint;
}

export const MarketTradingHistory = ({ userTrades, userTradingHistory, entityId }: MarketTradingHistoryProps) => {
  return (
    <div className="px-8">
      <div className="mt-4">Open Trades</div>
      <OrderRowHeader />
      <div className="flex-col flex gap-1 flex-grow overflow-y-auto">
        {userTrades.map((offer, index) => {
          const isBuy = offer.makerId === entityId;
          return <OrderRow key={index} offer={offer} entityId={entityId} isBuy={isBuy} />;
        })}
      </div>

      <div className="mt-4">History</div>
      <OrderRowHeader />
      <div className="flex-col flex gap-1 flex-grow overflow-y-auto">
        {userTradingHistory.map((offer, index) => {
          const isBuy = offer.makerId === entityId;
          return <OrderRow key={index} offer={offer} entityId={entityId} isBuy={isBuy} />;
        })}
      </div>
    </div>
  );
};
