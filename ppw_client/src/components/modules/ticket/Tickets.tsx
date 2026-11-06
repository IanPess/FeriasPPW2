"use client";

import { TicketCard } from "@/components/cards/TicketCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA';
  status: 'ABERTO' | 'CONCLUIDO';
}

export default function TicketsPages() {

  const [tickets, setTickets] = React.useState<Ticket[]>([]);

  const [id, setId] = React.useState<string>('');
  const [title, setTitle] = React.useState<string>('');
  const [description, setDescription] = React.useState<string>('');
  const [prioridade, setPrioridade] = React.useState<'BAIXA' | 'MEDIA' | 'ALTA'>('MEDIA');
  const [status, setStatus] = React.useState<'ABERTO' | 'CONCLUIDO'>('ABERTO');

  async function fetchTickets() {
    try {
      const response = await fetch("http://localhost:8000/ticket");
      const data = await response.json();

      // Garante que pegamos a lista, mesmo se a API retornar dentro de uma propriedade como { data: [...] } ou { tickets: [...] }
      if (Array.isArray(data)) {
        setTickets(data);
      } else if (Array.isArray(data.data)) {
        setTickets(data.data);
      } else if (Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      } else {
        setTickets([]);
      }
    } catch (error: any) {
      console.log(error);
      setTickets([]);
    }
  }

  React.useEffect(() => {
    fetchTickets();
  }, []);

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();

    await fetch("http://localhost:8000/ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, prioridade })
    });

    setTitle("");
    setDescription("");
    fetchTickets();
  }

  async function handleUpdateStatus(id: string, status: string) {
    const response = await fetch(`http://localhost:8000/ticket/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const data = await response.json();

    console.log(data);

    fetchTickets();
  }

  async function handleDeleteTicket(id: string) {
    const response = await fetch(`http://localhost:8000/ticket/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    console.log(data);
    fetchTickets();
  }

  return (
    <main className="container max-w-4xl mx-auto py-12 px-4 text-center space-y-12">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold">Sistema de Registro de Chamadas</h1>
        <p className="text-muted-foreground">Abra chamados de suporte técnico</p>
      </section>

      <form
        onSubmit={handleCreateTicket}
        className="p-6 border rounded-lg bg-card max-w-lg mx-auto space-y-4 text-left shadow-sm mt-6"
      >
        <Input
          type="text"
          placeholder="Digite o Código do chamado"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <Input
          type="text"
          placeholder="Digite o identificador do chamado"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          type="text"
          placeholder="Digite a descrição do chamado"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          type="text"
          placeholder="Digite a Prioridade do chamado"
          value={prioridade}
          onChange={(e) => setPrioridade(e.target.value as 'BAIXA' | 'MEDIA' | 'ALTA')}
        />

        <Input
          type="text"
          placeholder="Digite o status do chamado"
          value={status}
          onChange={(e) => setStatus(e.target.value as 'ABERTO' | 'CONCLUIDO')}
        />

        <Button type="submit" className="w-full sm:w-auto">Abrir Chamado</Button>
      </form>

      <section className="space-y-4 max-w-2xl mx-auto text-left">
        <h2 className="text-xl font-semibold text-center sm:text-left">Fila de Atendimento</h2>
        {
          !Array.isArray(tickets) || tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-2xl">
              Nenhum chamado no momento
            </p>
          ) : (
            tickets.map((ticket: Ticket, index) => (
              <TicketCard
                key={ticket.id || index}
                ticket={ticket}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDeleteTicket}
              />
            ))
          )
        }
      </section>
    </main>
  );
}