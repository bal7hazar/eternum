import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GetRealmsQuery } from "@/hooks/gql/graphql";
import { Button } from "../ui/button";
import { ResourceIcon } from "../ui/elements/ResourceIcon";
import { RealmMetadata } from "./realms-grid";

export interface RealmCardProps {
  pass: NonNullable<NonNullable<NonNullable<GetRealmsQuery>["tokenBalances"]>["edges"]>[0];
  toggleNftSelection?: (tokenId: string, collectionAddress: string) => void;
  isSelected?: boolean;
  metadata?: RealmMetadata;
}

export const PassCard = ({ pass, isSelected, toggleNftSelection }: RealmCardProps) => {
  const { tokenId, contractAddress, metadata } = pass!.node?.tokenMetadata ?? {};

  const handleCardClick = () => {
    if (toggleNftSelection) {
      toggleNftSelection(tokenId.toString(), contractAddress ?? "0x");
    }
  };

  const parsedMetadata: RealmMetadata | null = metadata ? JSON.parse(metadata) : null;
  const { attributes, name, image } = parsedMetadata ?? {};

  const realmSettled = true;

  return (
    <Card
      onClick={handleCardClick}
      className={`cursor-pointer transition-all duration-200 hover:border-gold ${isSelected ? "border-gold" : ""}`}
    >
      <img src={image} alt={name} className="w-full object-cover h-24 p-2 rounded-2xl" />
      <CardHeader>
        <CardTitle className=" items-center gap-2">
          <div className="uppercase text-sm mb-2 flex justify-between">
            Season 0 Pass
            <div className="flex items-center gap-2 text-sm"></div>
            {realmSettled ? (
              <div className="text-green">Realm Settled!</div>
            ) : (
              <div className="flex items-center gap-2">
                <Button disabled={true}>Settle</Button>
              </div>
            )}
          </div>
          <div className="flex justify-between gap-2">
            <div className=" text-3xl">{name}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {attributes
            ?.filter((attribute) => attribute.trait_type === "Resource")
            .map((attribute, index) => (
              <ResourceIcon resource={attribute.value as string} size="lg" key={`${attribute.trait_type}-${index}`} />
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
