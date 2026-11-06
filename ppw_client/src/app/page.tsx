'use client';

import { useEffect, useState } from 'react';
import { 
  getFuncionarios, 
  criarFuncionario, 
  atualizarFuncionario, 
  desativarFuncionario, 
  getSolicitacoesFerias, 
  aprovarFerias, 
  rejeitarFerias,
  cancelarFerias,
  solicitarFerias 
} from '@/lib/api';

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  setor?: string;
  saldoDias?: number;
  dataAdmissao?: string;
  status?: string;
}

interface Historico {
  id: string;
  estadoAnterior: string;
  novoEstado: string;
  timestamp: string;
  justificativa?: string;
  autor?: { nome: string };
}

interface Solicitacao {
  id: string;
  dataInicio: string;
  diasSolicitados: number;
  status: string;
  motivoRecusa?: string;
  funcionario?: { nome: string; setor?: string };
  historicos?: Historico[];
}

export default function Home() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de Histórico (Audit Log)
  const [solicitacaoModal, setSolicitacaoModal] = useState<Solicitacao | null>(null);

  // Form Funcionário
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [dataAdmissao, setDataAdmissao] = useState('');

  // Form Férias
  const [funcionarioId, setFuncionarioId] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [diasSolicitados, setDiasSolicitados] = useState(15);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [dadosFunc, dadosFerias] = await Promise.all([
        getFuncionarios(),
        getSolicitacoesFerias().catch(() => [])
      ]);
      setFuncionarios(dadosFunc);
      setSolicitacoes(dadosFerias);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const limparFormularioFuncionario = () => {
    setEditingId(null);
    setNome('');
    setEmail('');
    setCargo('');
    setDataAdmissao('');
  };

  const handleSalvarFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await atualizarFuncionario(editingId, { nome, email, cargo, dataAdmissao });
      } else {
        await criarFuncionario({ nome, email, cargo, dataAdmissao });
      }
      limparFormularioFuncionario();
      carregarDados();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar funcionário.');
    }
  };

  const handleEditClick = (f: Funcionario) => {
    setEditingId(f.id);
    setNome(f.nome);
    setEmail(f.email);
    setCargo(f.cargo);
    const formattedDate = f.dataAdmissao ? f.dataAdmissao.split('T')[0] : '';
    setDataAdmissao(formattedDate);
  };

  const handleDesativarFunc = async (id: string) => {
    try {
      await desativarFuncionario(id);
      carregarDados();
    } catch (err) {
      alert('Erro ao desativar funcionário.');
    }
  };

  const handleSolicitarFerias = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcionarioId) return alert('Selecione um funcionário!');
    try {
      await solicitarFerias({
        funcionarioId,
        dataInicio,
        diasSolicitados: Number(diasSolicitados),
      });
      setDataInicio('');
      setDiasSolicitados(15);
      carregarDados();
    } catch (err: any) {
      alert(err.message || 'Erro ao solicitar férias.');
    }
  };

  // Transições da Máquina de Estados
  const handleAprovar = async (id: string) => {
    try {
      await aprovarFerias(id, { justificativa: 'Aprovado via painel de RH.' });
      carregarDados();
    } catch (err: any) {
      alert(err.message || 'Erro ao aprovar solicitação.');
    }
  };

  const handleRejeitar = async (id: string) => {
    const motivo = prompt('Informe o motivo da recusa:');
    if (!motivo) return;
    try {
      await rejeitarFerias(id, { motivoRecusa: motivo });
      carregarDados();
    } catch (err: any) {
      alert(err.message || 'Erro ao recusar solicitação.');
    }
  };

  const handleCancelar = async (id: string) => {
    if (!confirm('Deseja realmente cancelar estas férias? Se estiverem aprovadas, o saldo será restaurado.')) return;
    try {
      await cancelarFerias(id, { justificativa: 'Cancelado pelo usuário.' });
      carregarDados();
    } catch (err: any) {
      alert(err.message || 'Erro ao cancelar solicitação.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Sistema de Gestão de Férias</h1>
            <p className="text-xs text-slate-400">Plataforma corporativa de RH</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-slate-400">API Conectada (8000)</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Form de Cadastro / Alteração de Funcionário */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">
              {editingId ? 'Alterar Colaborador' : 'Novo Colaborador'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={limparFormularioFuncionario}
                className="text-xs text-slate-400 hover:text-white underline transition"
              >
                Cancelar Edição
              </button>
            )}
          </div>
          <form onSubmit={handleSalvarFuncionario} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
            />
            <input
              type="email"
              placeholder="E-mail profissional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
            />
            <input
              type="text"
              placeholder="Cargo"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              required
              className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
            />
            <input
              type="date"
              value={dataAdmissao}
              onChange={(e) => setDataAdmissao(e.target.value)}
              required
              className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 transition text-slate-400"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 font-medium text-sm text-white rounded-lg px-4 py-2 transition shadow-md"
            >
              {editingId ? 'Salvar Alteração' : 'Cadastrar'}
            </button>
          </form>
        </section>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tabela de Funcionários */}
          <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-base font-semibold text-white">Quadro de Funcionários</h2>
              <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full">{funcionarios.length} cadastrados</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/50 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Nome / Cargo</th>
                    <th className="px-5 py-3.5">E-mail</th>
                    <th className="px-5 py-3.5 text-center">Saldo</th>
                    <th className="px-5 py-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr><td colSpan={4} className="p-6 text-center text-slate-500">Carregando dados...</td></tr>
                  ) : funcionarios.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-slate-500">Nenhum funcionário cadastrado.</td></tr>
                  ) : (
                    funcionarios.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-200">{f.nome}</div>
                          <div className="text-slate-500 text-[11px]">{f.cargo}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">{f.email}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-blue-950 text-blue-300 font-semibold border border-blue-800/40">
                            {f.saldoDias ?? 30} dias
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center space-x-2">
                          <button
                            onClick={() => handleEditClick(f)}
                            className="text-blue-400 hover:text-blue-300 hover:underline text-[11px] font-medium"
                          >
                            Alterar
                          </button>
                          <button
                            onClick={() => handleDesativarFunc(f.id)}
                            className="text-red-400 hover:text-red-300 hover:underline text-[11px] font-medium"
                          >
                            Desativar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Solicitar Férias & Lista de Pedidos */}
          <div className="space-y-6">
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-2">Solicitar Férias</h2>
              <form onSubmit={handleSolicitarFerias} className="space-y-3">
                <select
                  value={funcionarioId}
                  onChange={(e) => setFuncionarioId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione o funcionário</option>
                  {funcionarios.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome} ({f.saldoDias ?? 30} dias disponíveis)
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="Dias solicitados"
                  value={diasSolicitados}
                  onChange={(e) => setDiasSolicitados(Number(e.target.value))}
                  required
                  min={1}
                  max={30}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2 rounded-lg transition"
                >
                  Enviar Solicitação
                </button>
              </form>
            </section>

            {/* Card de Solicitações Recentes */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-3">Solicitações Recentes</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {solicitacoes.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Nenhuma solicitação cadastrada.</p>
                ) : (
                  solicitacoes.map((s) => (
                    <div key={s.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{s.funcionario?.nome || 'Colaborador'}</p>
                          <p className="text-[11px] text-slate-400">{s.diasSolicitados} dias solicitados</p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                          s.status === 'APROVADO' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' :
                          s.status === 'RECUSADO' ? 'bg-red-950 text-red-400 border border-red-800/50' :
                          s.status === 'CANCELADO' ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                          'bg-amber-950 text-amber-400 border border-amber-800/50'
                        }`}>
                          {s.status}
                        </span>
                      </div>

                      {/* Botões da Máquina de Estados */}
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/80">
                        {(s.status === 'SOLICITADO' || s.status === 'EM_ANALISE' || s.status === 'PENDENTE') && (
                          <>
                            <button
                              onClick={() => handleAprovar(s.id)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium py-1 rounded transition"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleRejeitar(s.id)}
                              className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-medium py-1 rounded transition"
                            >
                              Recusar
                            </button>
                          </>
                        )}

                        {s.status === 'APROVADO' && (
                          <button
                            onClick={() => handleCancelar(s.id)}
                            className="w-full bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-medium py-1 rounded transition"
                          >
                            Cancelar Férias
                          </button>
                        )}

                        <button
                          onClick={() => setSolicitacaoModal(s)}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium py-1 rounded transition mt-1"
                        >
                          Ver Histórico (Audit Log)
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Modal de Auditoria / Rastreabilidade */}
      {solicitacaoModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Histórico de Auditoria
              </h3>
              <button
                onClick={() => setSolicitacaoModal(null)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p><strong className="text-slate-200">Colaborador:</strong> {solicitacaoModal.funcionario?.nome}</p>
              <p><strong className="text-slate-200">Dias:</strong> {solicitacaoModal.diasSolicitados}</p>
              <p><strong className="text-slate-200">Status Atual:</strong> {solicitacaoModal.status}</p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Transições Registradas:</h4>
              {!solicitacaoModal.historicos || solicitacaoModal.historicos.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhum histórico registrado até o momento.</p>
              ) : (
                solicitacaoModal.historicos.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300 font-medium">
                      <span>{h.estadoAnterior} → <strong className="text-emerald-400">{h.novoEstado}</strong></span>
                      <span className="text-[10px] text-slate-500">{new Date(h.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                    {h.autor && <p className="text-[11px] text-slate-400">Por: {h.autor.nome}</p>}
                    {h.justificativa && <p className="text-[11px] text-slate-400 italic">"{h.justificativa}"</p>}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSolicitacaoModal(null)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2 rounded-lg transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}