import { useEntities } from "@/hooks/helpers/useEntities";
import Button from "@/ui/elements/Button";
import clsx from "clsx";
import { Play } from "lucide-react";
import { useCallback, useState } from "react";

export const Print = () => {
  const { playerStructures } = useEntities();
  const structures = playerStructures();
  const [hover, setHover] = useState(false);
  const onMouseEnter = useCallback(() => {
    setHover(true);
  }, []);
  const onMouseLeave = useCallback(() => {
    setHover(false);
  }, []);

  const handlePrint = useCallback(() => {
    console.log('structures', structures.filter((structure) => structure.category === 'Realm').map((structure) => structure.entity_id));
  }, [structures]);

  return (
    <div className="flex items-center gap-x-2">
      <h4 className="text-sm min-w-20">Print Realms</h4>
      <Button
        className={clsx("text-xs h-8", hover && "opacity-50")}
        onClick={handlePrint}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Play className="w-4 h-4" />
      </Button>
    </div>
  )
};