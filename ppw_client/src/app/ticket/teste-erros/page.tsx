import { TestButtons } from "./TestButtons";

interface PageProps {
  searchParams: Promise<{ serverCrash?: string }>;
}

export default async function TesteErrosPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Cenário 2: Erro assíncrono no servidor antes da renderização
  if (params.serverCrash === "true") {
    throw new Error("Falha de conexão com o PostgreSQL ao buscar tickets (Server Component)");
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        Painel de Validação de Resiliência — Tickets
      </h1>
      <p className="mb-6 text-sm text-slate-600">
        Clique nos botões abaixo para simular falhas em produção e validar o envio de eventos para o GlitchTip.
      </p>
      <TestButtons />
    </main>
  );
}