import { RESOURCE_TIERS } from "@bibliothecadao/eternum";
import { ResourceChip } from "./ResourceChip";
import { useMemo } from "react";

export const EntityResourceTable = ({ entityId }: { entityId: bigint | undefined }) => {
  if (!entityId) {
    return <div>Entity not found</div>;
  }

  const resourceElements = () => {
    return Object.entries(RESOURCE_TIERS).map(([tier, resourceIds]) => {
      const resources = resourceIds.map((resourceId) => {
        return <ResourceChip key={resourceId} resourceId={resourceId} entityId={entityId} />;
      });

      return (
        <div className="my-3 px-3" key={tier}>
          <h5 className="text-center capitalize">{tier}</h5>

          <div className="grid grid-cols-2 gap-2 flex-wrap mt-2">{resources}</div>
        </div>
      );
    });
  };

  return <div>{resourceElements()}</div>;
};
