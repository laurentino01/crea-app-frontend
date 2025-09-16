"use-client";

import { ReactElement, ReactNode } from "react";
import SideButton from "./SideButton";
import Image from "next/image";
import { Folder, Gauge, Handshake, Trophy, Users } from "lucide-react";

type Tlinks = {
  href: string;
  icon: ReactElement;
  title: string;
};

export default function SideNav() {
  const links: Tlinks[] = [
    { href: "/dashboard", icon: <Gauge />, title: "Dashboard" },
    { href: "/projetos", icon: <Folder />, title: "Projetos" },
    { href: "/equipe", icon: <Users />, title: "Equipe" },
    { href: "/ranking", icon: <Trophy />, title: "Ranking" },
  ];

  return (
    <aside className="w-[260px] p-6 bg-fuchsia-900 sticky shadow flex flex-col gap-3 top-0 h-screen overflow-auto ">
      <div className="flex items-center gap-3">
        <Image
          src="https://www.creamidia.com.br/images/about/logo-about.svg"
          width={33}
          height={36}
          alt="logo"
        ></Image>
        <div>
          <div className="font-bold text-purple-50 ">Creamidia</div>
          <div className="text-gray-100" style={{ fontSize: "12px" }}>
            Painel de Gestão
          </div>
        </div>
      </div>
      <ul className="list-none p-0 mt-2 flex flex-col gap-[6px]">
        {links.map((link, index) => {
          return (
            <li key={index}>
              <SideButton href={link.href}>
                {link.icon} {link.title}{" "}
              </SideButton>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
