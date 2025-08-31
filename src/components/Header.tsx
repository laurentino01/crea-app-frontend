"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import UserProfileButton from "./UserProfileButton";
import { Search } from "lucide-react";
import SearchInput from "./SearchInput";
import ThemeToggle from "./ThemeToggle";
import NotificationButton from "./NotificationButton";

type tPageTitle = {
  title: string;
  explain: string;
};

type tPages = {
  dashboard: tPageTitle;
  clientes: tPageTitle;
  projetos: tPageTitle;
  equipe: tPageTitle;
  ranking: tPageTitle;
};

export default function Header() {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState<any>("dashboard");

  const pageTitle: any = {
    dashboard: {
      title: "Dashboard",
      explain: "Visão geral — Alocação & status de projetos",
    },
    clientes: {
      title: "Clientes",
      explain: "Adicione & visualize os clientes",
    },
    projetos: {
      title: "Projetos",
      explain: "Adicione & administre projetos",
    },
    equipe: {
      title: "Equipe",
      explain: "Adicione novos membros & visualize informações",
    },
    ranking: {
      title: "Ranking",
      explain: "Visão do posicionamento dos membros",
    },
  };

  useEffect(() => {
    setCurrentPage(pathname.slice(1));
  }, [pathname]);

  return (
    <header className="flex justify-between items-start mb-6 text-neutral-950 dark:text-neutral-200 ">
      <div className="flex flex-col justify-start items-start mb-6">
        <h1 className="text-xl font-bold "> {pageTitle[currentPage].title} </h1>
        <p className="text-gray-400 text-md">
          {pageTitle[currentPage].explain}
        </p>
      </div>
      <div>
        <SearchInput />
      </div>

      <div className="flex gap-2 items-center">
        <ThemeToggle />
        <NotificationButton />
        <UserProfileButton
          name="Godofredo Australoptecus"
          onClick={() => console.log("clicaram-me")}
        ></UserProfileButton>
      </div>
    </header>
  );
}
