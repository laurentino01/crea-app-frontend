type PageProps = {
  params: { id: string };
};

export default function UsuarioDetalhes({ params }: PageProps) {
  return (
    <section className="w-full min-h-[200px] bg-neutral-50 dark:bg-neutral-900 p-6 rounded-lg">
      <h1 className="text-xl font-bold mb-2 text-neutral-900 dark:text-neutral-100">
        Detalhes do Usuário
      </h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        ID: {params.id}
      </p>
      {/* Página em branco para implementação futura */}
    </section>
  );
}
