import { Plus } from "lucide-react";

export default function Equipe() {
  return (
    <>
      <section className="w-full flex justify-end">
        <button className="flex gap-4 items-center bg-fuchsia-900 rounded-full py-2 px-4 text-neutral-50 cursor-pointer hover:bg-purple-400 active:bg-fuchsia-950">
          <Plus size={22} />
          Adicionar Membro
        </button>
      </section>
    </>
  );
}
