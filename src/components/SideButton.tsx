import Link from "next/link";
import { ReactNode } from "react";

export default function SideButton({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex text-neutral-200 items-center gap-3 p-3 rounded-xl  no-underline font-semibold transition-colors duration-200 hover:bg-purple-400 "
    >
      {children}
    </Link>
  );
}
