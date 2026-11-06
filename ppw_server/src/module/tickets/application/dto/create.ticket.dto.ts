

export class CreateTicketDto{
  id?:string;
  title!:string;
  description!: string;
  prioridade!: 'BAIXA' | 'MEDIA ' | 'ALTA';
}
