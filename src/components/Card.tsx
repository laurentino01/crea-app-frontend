import React from "react";

export type CardProps = {
  className?: string;
  children?: React.ReactNode;
};

// Base container only. Content is implemented at the page level.
export default function Card({ className = "", children }: CardProps) {
  return (
    <div
      className={[
        "p-5 rounded-xl  bg-white text-neutral-900 shadow transition-transform duration-200 hover:scale-[1.03]",
        "  dark:bg-neutral-900 dark:text-neutral-100",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
