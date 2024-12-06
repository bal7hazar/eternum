import { LeaderboardManager } from "@/dojo/modelManager/LeaderboardManager";
import { Player } from "@bibliothecadao/eternum";
import { getComponentValue, Has, HasValue, runQuery } from "@dojoengine/recs";
import { shortString } from "starknet";
import { useDojo } from "../context/DojoContext";
import { useEntitiesUtils } from "./useEntities";

import { PRIZE_POOL_PLAYERS } from "@/ui/constants";
import { calculateLordsShare, calculatePlayerSharePercentage } from "@/ui/utils/leaderboard";
import { StructureType } from "@bibliothecadao/eternum";

export const useGetAllPlayers = () => {
  const {
    setup: {
      components: { Realm, Owner, GuildMember, AddressName, Hyperstructure, Structure },
    },
  } = useDojo();
  const nextBlockTimestamp = Math.floor(Date.now() / 1000);

  const { getEntityName } = useEntitiesUtils();

  const playerEntities = runQuery([Has(AddressName)]);
  const playersByRank = LeaderboardManager.instance().getPlayersByRank(nextBlockTimestamp || 0);

  const totalPoints = playersByRank.reduce((sum, [, points]) => sum + points, 0);

  const getPlayers = (): Player[] => {
    const players = Array.from(Array.from(playerEntities))
      .map((id) => {
        const addressName = getComponentValue(AddressName, id);
        if (!addressName) return;

        const isAlive = !!runQuery([HasValue(Owner, { address: addressName.address })]).size;

        const guildMember = getComponentValue(GuildMember, id);
        const guildName = guildMember ? getEntityName(guildMember.guild_entity_id) : "";

        return {
          address: addressName.address,
          addressName: shortString.decodeShortString(addressName.name.toString()),
          isAlive,
          guildName,
        };
      })
      .filter((player) => player !== undefined);

    let unrankedCount = 0;

    return players.map((player) => {
      const rankIndex = playersByRank.findIndex(([address]) => address === player.address);
      if (rankIndex === -1) unrankedCount++;

      const points = rankIndex === -1 ? 0 : playersByRank[rankIndex][1];

      return {
        name: player.addressName,
        address: player.address,
        points,
        rank: rankIndex === -1 ? Number.MAX_SAFE_INTEGER : rankIndex + 1,
        percentage: calculatePlayerSharePercentage(points, totalPoints),
        lords: calculateLordsShare(points, totalPoints, PRIZE_POOL_PLAYERS),
        realms: runQuery([Has(Realm), HasValue(Owner, { address: player.address })]).size,
        mines: runQuery([
          HasValue(Structure, { category: StructureType[StructureType.FragmentMine] }),
          HasValue(Owner, { address: player.address }),
        ]).size,
        hyperstructures: runQuery([Has(Hyperstructure), HasValue(Owner, { address: player.address })]).size,
        isAlive: player.isAlive,
        guildName: player.guildName,
      };
    });
  };

  return getPlayers;
};