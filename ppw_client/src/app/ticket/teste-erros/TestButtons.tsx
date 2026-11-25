"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

export function TestButtons() {
  const [shouldCrashClient, setShouldCrashClient] = useState(false);

  // Cenário 1: Erro de renderização no client (aciona src/app/ticket/error.tsx)
  if (shouldCrashClient) {
    throw new Error("Falha ao processar formulário de ticket no client");
  }

  // Cenário 3: Erro de regra de negócio capturado manualmente via SDK
  const handleBusinessRuleError = () => {
    try {
      throw new Error("Falha de validação: limite de tickets simultâneos por usuário excedido");
    } catch (err) {
      Sentry.captureException(err);
      alert("Erro de regra de negócio capturado e enviado ao GlitchTip!");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => setShouldCrashClient(true)}
        className="rounded-md bg-red-600 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-red-700"
      >
        1. Disparar Erro de Renderização Client-side (Testar error.tsx + reset)
      </button>

      <a
        href="/ticket/teste-erros?serverCrash=true"
        className="block rounded-md bg-amber-600 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-amber-700"
      >
        2. Disparar Erro Assíncrono / Server Component (Simular queda do banco)
      </a>

      <button
        onClick={handleBusinessRuleError}
        className="rounded-md bg-slate-800 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-slate-900"
      >
        3. Disparar Erro de Regra de Negócio (Envio direto ao GlitchTip)
      </button>
    </div>
  );
}