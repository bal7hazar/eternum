import { Realm, Structure } from "@/hooks/helpers/useStructures";
import { motion } from "framer-motion";

export const EntityAvatar = ({ structure, empty = false }: { structure?: Realm | Structure; empty?: boolean }) => {
  const imgSource = Boolean(structure) ? "./images/buildings/thumb/castle.png" : "./images/avatars/2.png";

  const slideUp = {
    hidden: { y: "100%" },
    visible: { y: "0%", transition: { duration: 0.6 } },
  };
  return (
    <div className="col-span-2 flex">
      {" "}
      <div className="mx-auto flex flex-col gap-4 p-3 w-[15vw]">
        {!empty && (
          <motion.img
            initial="hidden"
            animate="visible"
            variants={slideUp}
            className="w-42 h-42 clip-angled  -mt-24"
            src={imgSource}
            alt=""
          />
        )}
      </div>
    </div>
  );
};
