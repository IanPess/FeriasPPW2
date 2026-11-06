export class CreateFuncionarioDto {
  nome: string;
  email: string;
  cargo: string;
  dataAdmissao: string; // Formato YYYY-MM-DD
  saldoDias?: number;   // Opcional, padrão é 30
  gestorId?: string;    // ID de outro funcionário (opcional)
}