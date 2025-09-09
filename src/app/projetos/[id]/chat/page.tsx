"use client";

import Avatar from "@/components/Avatar";
import { MouseEvent } from "react";

export default function projetoDetalhesChat() {
  const id = 0;

  function handleChangeSection(idElement: string) {
    const currentElement = document.querySelector(`#${idElement}`);
    const otherElements = document.querySelectorAll(
      `#chat > *:not(#${idElement})`
    );

    otherElements.forEach((e) => {
      e.classList.remove("block");
      e.classList.add("none");
    });

    currentElement?.classList.add("block");
    currentElement?.classList.remove("none");
  }
  return (
    <section id="chat">
      <section
        className="flex items-center justify-between"
        id="projeto-chat-conversas"
      >
        <div>
          <h3 className="">Conversas iniciadas</h3>
          <div className="flex gap-2 mt-4 items-center">
            chat equipe
            <button
              className="p-2 bg-neutral-800 rounded-full cursor-pointer"
              onClick={() => handleChangeSection("projeto-chat-equipe")}
            >
              conversar
            </button>
          </div>
        </div>
        <div>
          Disponíveis para conversa
          <div className="flex gap-2 mt-4 items-center">
            <Avatar name={"nome usuário"} />
            <div className="flex flex-col">
              Nome usuário
              <button className=" bg-neutral-800 rounded-full cursor-pointer">
                conversar
              </button>
            </div>
          </div>
        </div>
      </section>
      <section id="projeto-chat-equipe"></section>
      <section id={`projeto-chat-${id}`}></section>
    </section>
  );
}
