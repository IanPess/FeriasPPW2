export class CriarSolicitacaoDto {
  funcionarioId: string;
  dataInicio: string; // Formato YYYY-MM-DD
  diasSolicitados: number;
  abonoPecuniario?: boolean;
}