"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-900">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Indisponibilidade Crítica na Plataforma
          </h2>
          <p className="mb-6 text-sm text-slate-600">
            Ocorreu uma falha estrutural inesperada na aplicação. Nossa equipe já foi notificada via telemetria.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Recarregar aplicação
          </button>
        </div>
      </body>
    </html>
  );
}