import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA';
  status: 'ABERTO' | 'CONCLUIDO';
}

interface TicketCardProps {
  ticket: Ticket;
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export function TicketCard({ ticket, onUpdateStatus, onDelete }: TicketCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-base font-bold">
          {ticket.title}
        </CardTitle>
        <Badge variant={ticket.prioridade === 'ALTA' ? 'destructive' : 'secondary'}>
          {ticket.prioridade}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{ticket.description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className={`text-xs font-semibold ${ticket.status === "CONCLUIDO" ? "text-emerald-600" : "text-amber-600"}`}>
            {ticket.status}
          </span>

          <div className="flex gap-2">
            {
              ticket.status === "ABERTO" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateStatus(ticket.id, "CONCLUIDO")}>
                  Concluir
                </Button>
              )
            }
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => onDelete(ticket.id)}>
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}