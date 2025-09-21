"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function SideButton({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(pathname === href);
  }, [pathname]);

  return (
    <Link
      href={href}
      className={`flex text-neutral-200 items-center gap-3 p-3 rounded-xl  no-underline font-semibold transition-colors duration-200 hover:bg-purple-400  ${
        isActive ? "bg-purple-400" : ""
      }`}
    >
      {children}
    </Link>
  );
}
