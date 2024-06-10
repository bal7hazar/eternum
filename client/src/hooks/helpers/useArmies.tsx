import { ClientComponents } from "@/dojo/createClientComponents";
import { Position } from "@bibliothecadao/eternum";
import { useEntityQuery } from "@dojoengine/react";
import { Component, Entity, Has, HasValue, NotValue, getComponentValue, runQuery } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useMemo } from "react";
import { shortString } from "starknet";
import { useDojo } from "../context/DojoContext";

export type ArmyAndName = ClientComponents["Army"]["schema"] & { name: string } & ClientComponents["Health"]["schema"] &
  ClientComponents["Protectee"]["schema"] &
  ClientComponents["Quantity"]["schema"] &
  ClientComponents["Movable"]["schema"] &
  ClientComponents["Capacity"]["schema"] &
  ClientComponents["ArrivalTime"]["schema"] &
  ClientComponents["Position"]["schema"] &
  ClientComponents["EntityOwner"]["schema"] &
  ClientComponents["Stamina"]["schema"] &
  ClientComponents["Owner"]["schema"] & { realm: ClientComponents["Realm"]["schema"] } & {
    homePosition: ClientComponents["Position"]["schema"];
  };

const formatArmies = (
  armies: Entity[],
  Army: Component,
  Protectee: Component,
  Name: Component,
  Health: Component,
  Quantity: Component,
  Movable: Component,
  Capacity: Component,
  ArrivalTime: Component,
  Position: Component,
  EntityOwner: Component,
  Owner: Component,
  Realm: Component,
  Stamina: Component,
): ArmyAndName[] => {
  return armies.map((id) => {
    const army = getComponentValue(Army, id) as ClientComponents["Army"]["schema"];
    const protectee = getComponentValue(Protectee, id) as ClientComponents["Protectee"]["schema"];
    const health = getComponentValue(Health, id) as ClientComponents["Health"]["schema"];
    const quantity = getComponentValue(Quantity, id) as ClientComponents["Quantity"]["schema"];
    const movable = getComponentValue(Movable, id) as ClientComponents["Movable"]["schema"];
    const capacity = getComponentValue(Capacity, id) as ClientComponents["Capacity"]["schema"];
    const arrivalTime = getComponentValue(ArrivalTime, id) as ClientComponents["ArrivalTime"]["schema"];
    const position = getComponentValue(Position, id) as ClientComponents["Position"]["schema"];
    const entityOwner = getComponentValue(EntityOwner, id) as ClientComponents["EntityOwner"]["schema"];
    const stamina = getComponentValue(Stamina, id) as ClientComponents["Stamina"]["schema"];
    let owner = getComponentValue(Owner, id) as ClientComponents["Owner"]["schema"];
    if (!owner && entityOwner?.entity_owner_id) {
      owner = getComponentValue(
        Owner,
        getEntityIdFromKeys([BigInt(entityOwner.entity_owner_id)]),
      ) as ClientComponents["Owner"]["schema"];
    }
    const name = getComponentValue(Name, id) as ClientComponents["EntityName"]["schema"];
    const realm =
      entityOwner &&
      (getComponentValue(
        Realm,
        getEntityIdFromKeys([BigInt(entityOwner.entity_owner_id)]),
      ) as ClientComponents["Realm"]["schema"]);
    const homePosition =
      realm &&
      (getComponentValue(
        Position,
        getEntityIdFromKeys([BigInt(realm.realm_id)]),
      ) as ClientComponents["Position"]["schema"]);

    return {
      ...army,
      ...protectee,
      ...health,
      ...quantity,
      ...movable,
      ...capacity,
      ...arrivalTime,
      ...position,
      ...entityOwner,
      ...stamina,
      ...owner,
      realm,
      homePosition,
      name: name
        ? shortString.decodeShortString(name.name.toString())
        : `${protectee ? "🛡️" : "🗡️"}` + `Army ${army?.entity_id}`,
    };
  });
};

export const useArmies = () => {
  const {
    setup: {
      components: {
        Position,
        EntityOwner,
        Owner,
        Health,
        Quantity,
        Movable,
        Capacity,
        ArrivalTime,
        Realm,
        Army,
        Protectee,
        EntityName,
        Stamina,
      },
    },
  } = useDojo();

  const armies = useEntityQuery([
    Has(Army),
    Has(Health),
    NotValue(Movable, { sec_per_km: 0 }),
    NotValue(Health, { current: 0n }),
  ]);

  return {
    getArmies: () =>
      formatArmies(
        armies,
        Army,
        Protectee,
        EntityName,
        Health,
        Quantity,
        Movable,
        Capacity,
        ArrivalTime,
        Position,
        EntityOwner,
        Owner,
        Realm,
        Stamina,
      ),
  };
};

export const useEntityArmies = ({ entity_id }: { entity_id: bigint }) => {
  const {
    setup: {
      components: {
        Position,
        EntityOwner,
        Owner,
        Health,
        Quantity,
        Movable,
        Capacity,
        ArrivalTime,
        Realm,
        Army,
        Protectee,
        EntityName,
        Stamina,
      },
    },
  } = useDojo();

  const armies = useEntityQuery([Has(Army), HasValue(EntityOwner, { entity_owner_id: entity_id })]);

  const entityArmies = useMemo(() => {
    return formatArmies(
      armies,
      Army,
      Protectee,
      EntityName,
      Health,
      Quantity,
      Movable,
      Capacity,
      ArrivalTime,
      Position,
      EntityOwner,
      Owner,
      Realm,
      Stamina,
    );
  }, [armies]);

  return {
    entityArmies,
  };
};

export const usePositionArmies = ({ position }: { position: Position }) => {
  {
    const {
      setup: {
        components: {
          Position,
          EntityOwner,
          Owner,
          Health,
          Quantity,
          Movable,
          Capacity,
          ArrivalTime,
          Realm,
          Army,
          Protectee,
          EntityName,
          Stamina,
        },
      },
      account: { account },
    } = useDojo();

    const allArmiesAtPosition = useEntityQuery([Has(Army), HasValue(Position, position)]);

    const allArmies = useMemo(() => {
      return formatArmies(
        allArmiesAtPosition,
        Army,
        Protectee,
        EntityName,
        Health,
        Quantity,
        Movable,
        Capacity,
        ArrivalTime,
        Position,
        EntityOwner,
        Owner,
        Realm,
        Stamina,
      );
    }, [allArmiesAtPosition]);

    const userArmies = useMemo(() => {
      return allArmies.filter((army: any) => {
        const entityOwner = getComponentValue(EntityOwner, getEntityIdFromKeys([army?.entity_id || 0n]));
        const owner = getComponentValue(Owner, getEntityIdFromKeys([entityOwner?.entity_owner_id || 0n]));
        return owner?.address === BigInt(account.address);
      });
    }, [allArmies]);

    const enemyArmies = useMemo(() => {
      return allArmies.filter((army: any) => {
        const entityOwner = getComponentValue(EntityOwner, getEntityIdFromKeys([army?.entity_id || 0n]));
        const owner = getComponentValue(Owner, getEntityIdFromKeys([entityOwner?.entity_owner_id || 0n]));

        return owner?.address !== BigInt(account.address);
      });
    }, [allArmies]);

    return {
      allArmies,
      enemyArmies,
      userArmies,
    };
  }
};

export const getArmyByEntityId = (entity_id: bigint) => {
  const {
    setup: {
      components: {
        Position,
        EntityOwner,
        Owner,
        Health,
        Quantity,
        Movable,
        Capacity,
        ArrivalTime,
        Realm,
        Army,
        Protectee,
        EntityName,
        Stamina,
      },
    },
  } = useDojo();

  const armies = runQuery([Has(Army), HasValue(Army, { entity_id: entity_id })]);

  return formatArmies(
    Array.from(armies),
    Army,
    Protectee,
    EntityName,
    Health,
    Quantity,
    Movable,
    Capacity,
    ArrivalTime,
    Position,
    EntityOwner,
    Owner,
    Realm,

    Stamina,
  )[0];
};
