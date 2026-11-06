const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getFuncionarios() {
  try {
    const res = await fetch(`${API_URL}/funcionarios`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Erro na requisição getFuncionarios:", error);
    return [];
  }
}

export async function criarFuncionario(data: {
  nome: string;
  email: string;
  cargo: string;
  dataAdmissao: string;
}) {
  const res = await fetch(`${API_URL}/funcionarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao cadastrar funcionário');
  }
  return res.json();
}

export async function atualizarFuncionario(
  id: string,
  data: {
    nome: string;
    email: string;
    cargo: string;
    dataAdmissao: string;
  }
) {
  const res = await fetch(`${API_URL}/funcionarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao atualizar funcionário');
  }
  return res.json();
}

export async function desativarFuncionario(id: string) {
  const res = await fetch(`${API_URL}/funcionarios/${id}/desativar`, {
    method: 'PATCH',
  });
  if (!res.ok) throw new Error('Erro ao desativar funcionário');
  return res.json();
}

export async function getSolicitacoesFerias() {
  try {
    const res = await fetch(`${API_URL}/ferias`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Erro na requisição getSolicitacoesFerias:", error);
    return [];
  }
}

export async function solicitarFerias(data: {
  funcionarioId: string;
  dataInicio: string;
  diasSolicitados: number;
  abonoPecuniario?: boolean;
}) {
  const res = await fetch(`${API_URL}/ferias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao solicitar férias');
  }
  return res.json();
}

// 1. Aprovar férias (suporta justificativa e autor para Audit Log)
export async function aprovarFerias(id: string, body?: { justificativa?: string; autorId?: string }) {
  const res = await fetch(`${API_URL}/ferias/${id}/aprovar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao aprovar férias');
  }
  return res.json();
}

// 2. Rejeitar / Recusar férias
export async function rejeitarFerias(id: string, body?: { motivoRecusa?: string; autorId?: string }) {
  const res = await fetch(`${API_URL}/ferias/${id}/rejeitar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao recusar férias');
  }
  return res.json();
}

// 3. Cancelar férias (restaura saldo se já aprovadas)
export async function cancelarFerias(id: string, body?: { justificativa?: string; autorId?: string }) {
  const res = await fetch(`${API_URL}/ferias/${id}/cancelar`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao cancelar férias');
  }
  return res.json();
}