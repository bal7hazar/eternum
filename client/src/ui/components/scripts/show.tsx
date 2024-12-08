import useScriptStore from "@/hooks/store/useScriptStore";
import Button from "@/ui/elements/Button";
import TextInput from "@/ui/elements/TextInput";
import clsx from "clsx";
import { Play } from "lucide-react";
import { useCallback, useState } from "react";

export const Show = () => {
    const { setShows } = useScriptStore();
    const [hover, setHover] = useState(false);
    const [value, setValue] = useState<string>();
    const onMouseEnter = useCallback(() => {
      setHover(true);
    }, []);
    const onMouseLeave = useCallback(() => {
      setHover(false);
    }, []);

    const handleShow = useCallback(() => {
      if (value) {
        try {
          console.log(JSON.parse(value));
          setShows(JSON.parse(value));
        } catch (error) {
          console.error(error);
        }
      } else {
        setShows([]);
      }
    }, [value]);

    return (
      <div className="flex items-center gap-x-2">
        <h4 className="text-sm min-w-20">Show Only</h4>
        <TextInput onChange={(v: string) => setValue(v)} placeholder="All" />
        <Button
          className={clsx("text-xs h-8", hover && "opacity-50")}
          onClick={handleShow}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <Play className="w-4 h-4" />
        </Button>
      </div>
    )
  };