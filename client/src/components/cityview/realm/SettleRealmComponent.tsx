import { useState } from "react";
import Button from "../../../elements/Button";
import realms from "../../../data/realms.json";
import realmCoords from "../../../geodata/coords.json";
import { useDojo } from "../../../DojoContext";
import { Realm } from "../../../types";
import { findResourceIdByTrait } from "../../../constants/resources";
import { packResources } from "../../../utils/packedData";
import { orders } from "../../../constants/orders";
import { getLatestRealmId } from "../../../hooks/graphql/useGraphQLQueries";
import { soundSelector, useUiSounds } from "../../../hooks/useUISound";
import useRealmStore from "../../../hooks/store/useRealmStore";

export const MAX_REALMS = 5;

export const SettleRealmComponent = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    setup: {
      systemCalls: { create_realm, mint_resources },
    },
    account: { account, masterAccount },
  } = useDojo();

  const { play: playSign } = useUiSounds(soundSelector.sign);

  const { realmEntityIds } = useRealmStore();

  const canSettle = realmEntityIds.length < MAX_REALMS;

  const settleRealm = async () => {
    setIsLoading(true);
    // if no realm id latest realm id is 0
    const realm_id = await getLatestRealmId();

    // take next realm id
    let new_realm_id = realm_id + 1;
    let realm = getRealm(new_realm_id);
    let position = getPosition(new_realm_id);
    let entity_id = await create_realm({
      signer: masterAccount,
      owner: BigInt(account.address),
      ...realm,
      position,
    });
    // mint basic resources to start
    await mint_resources({
      signer: masterAccount,
      entity_id,
      resource_type: 2,
      amount: 1000,
    });
    await mint_resources({
      signer: masterAccount,
      entity_id,
      resource_type: 3,
      amount: 1000,
    });
    await mint_resources({
      signer: masterAccount,
      entity_id,
      resource_type: 253,
      amount: 1000,
    });
    setIsLoading(false);
    playSign();
  };

  return (
    <div className="flex items-center h-min">
      {!isLoading && (
        <Button
          disabled={!canSettle}
          onClick={settleRealm}
          className="ml-auto p-2 !h-8 text-lg !rounded-md"
          variant="success"
        >
          Settle Realm
        </Button>
      )}
      {isLoading && (
        <Button isLoading={true} onClick={() => {}} variant="danger" className="ml-2 p-2 !h-4 text-xxs !rounded-md">
          {}
        </Button>
      )}
    </div>
  );
};

export function getPosition(realm_id: number): { x: number; y: number } {
  const coords = realmCoords.features[realm_id - 1].geometry.coordinates.map((value) => parseInt(value));
  return { x: coords[0] + 1800000, y: coords[1] + 1800000 };
}

interface Attribute {
  trait_type: string;
  value: any;
}

export function getRealm(realm_id: number): Realm {
  const realmsData = realms as {
    [key: string]: any;
  };
  const realm = realmsData[realm_id.toString()];
  const resourceIds = realm.attributes
    .filter(({ trait_type }: Attribute) => trait_type === "Resource")
    .map(({ value }: Attribute) => findResourceIdByTrait(value));
  const resource_types_packed = parseInt(packResources(resourceIds));
  let cities: number = 0;
  realm.attributes.forEach(({ trait_type, value }: Attribute) => {
    if (trait_type === "Cities") {
      cities = value;
    }
  });
  let harbors: number = 0;
  realm.attributes.forEach(({ trait_type, value }: Attribute) => {
    if (trait_type === "Harbors") {
      harbors = value;
    }
  });
  let rivers: number = 0;
  realm.attributes.forEach(({ trait_type, value }: Attribute) => {
    if (trait_type === "Rivers") {
      rivers = value;
    }
  });
  let regions: number = 0;
  realm.attributes.forEach(({ trait_type, value }: Attribute) => {
    if (trait_type === "Regions") {
      regions = value;
    }
  });

  const wonder: number = 1;

  let order: number = 0;
  realm.attributes.forEach(({ trait_type, value }: Attribute) => {
    if (trait_type === "Order") {
      const name: string = value.split(" ").pop() || "";
      orders.forEach(({ orderId, orderName }) => {
        if (name === orderName) {
          order = orderId;
        }
      });
    }
  });

  return {
    realm_id,
    resource_types_packed,
    resource_types_count: resourceIds.length,
    cities,
    harbors,
    rivers,
    regions,
    wonder,
    order,
  };
}

export default SettleRealmComponent;
