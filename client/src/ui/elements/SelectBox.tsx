import clsx from "clsx";
import React from "react";
import { Checkbox } from "./Checkbox";

type SelectBoxProps = {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const SelectBox = ({ selected, onClick, children }: SelectBoxProps) => (
  <div
    className={clsx(
      "p-2 cursor-pointer text-gold  flex gap-3 justify-between items-center rounded transition-colors duration-200 hover:bg-dark",
      selected && "bg-gold/20",
    )}
    onClick={onClick}
  >
    {children}
    <Checkbox enabled={selected} />
  </div>
);
