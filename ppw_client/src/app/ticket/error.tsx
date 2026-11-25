"use client";

import { useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TicketError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const handleRetry = () => {
    startTransition(() => {
      // Remove o parâmetro ?serverCrash=true se vier do teste de Server Component
      if (window.location.search.includes("serverCrash=true")) {
        router.replace(window.location.pathname);
      }
      router.refresh();
      reset();
    });
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md rounded-lg border border-red-200 bg-white p-8 shadow-sm">
        <h2 className="mb-2 text-xl font-semibold text-slate-900">
          Falha ao processar solicitação do ticket
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          Não foi possível carregar ou registrar os dados do ticket no momento.
          O relatório técnico desta falha já foi enviado automaticamente para o monitoramento.
        </p>

        {error.digest && (
          <p className="mb-4 rounded bg-slate-100 px-3 py-1 font-mono text-xs text-slate-500">
            Código do incidente: {error.digest}
          </p>
        )}

        <button
          onClick={handleRetry}
          className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}