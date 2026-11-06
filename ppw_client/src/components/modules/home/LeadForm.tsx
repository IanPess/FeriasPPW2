
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";



export function LeadForm() {

  const [email, setEmail] = React.useState<string>('');
  const [status, setStatus ] = React.useState<'loading'| 'success' | 'error' | 'idle' >('idle');
  const handleSubmit =  async (e: React.SubmitEvent) => {
     e.preventDefault();
     setStatus('loading');
     try {
      //5.1.11 - Consumir uma API Rest
      const response = await fetch('http://localhost:8000/leads', {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({email})
      });

      if (!response.ok) throw new Error();
      setStatus('success');
      setEmail('');
     } catch(error) {
       console.log(error);
       setStatus('error');
     }

  }

  return (
    // 5.1.8 Formulários
    <form onSubmit={handleSubmit}>
       <Input
         type="email"
         placeholder="Seu e-mail"
         value={email}
         onChange={(e)=> setEmail(e.target.value)}
       />
       { /* 5.1.4 elementos interativos  */ }
       <Button
         type="submit"
         disabled={status === 'loading'}
         >{ status === 'loading' ? 'Enviando ' : 'Cadastrar' }</Button>
       { /* 5.1.7 renderização condicional  */ }
       {
        status=== 'success' && (
          <p className="text-sm text-green-600">Lead cadastrado com sucesso</p>
        )
       }
       {
        status=== 'error' && (
          <p className="text-sm text-red-600">Erro ao enviar os dados. Tente novamente mais tarde</p>
        )
       }
    </form>
  )

}
