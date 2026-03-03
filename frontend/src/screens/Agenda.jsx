import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import RemarcarAula from "../components/RemarcarAula";
import { API_URL } from "../config";

function Agenda() {
  const [aulas, setAulas] = useState([]);
  const [alunos, setAlunos] = useState([]);

  const hoje = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(
    hoje.toISOString().slice(0, 7)
  );

  const [filtroAluno, setFiltroAluno] = useState("todos");

  const [modalRemarcar, setModalRemarcar] = useState(false);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);

  const carregar = () => {
    fetch("${API_URL}/agenda")
      .then(res => res.json())
      .then(data => setAulas(data));

    fetch("${API_URL}/alunos")
      .then(res => res.json())
      .then(data => setAlunos(data));
  };

  useEffect(() => {
    carregar();
  }, []);

  const atualizarStatus = async (id, status) => {
    await fetch(`${API_URL}/aulas/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    carregar();
  };

  const formatarData = (data) =>
    new Date(data).toLocaleDateString();

  const formatarHora = (data) =>
    new Date(data).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  // 🔹 Filtro por mês
  const aulasMes = aulas.filter(a =>
    a.data_agendada.startsWith(mesSelecionado)
  );

  // 🔹 Filtro por aluno
  const aulasFiltradas =
    filtroAluno === "todos"
      ? aulasMes
      : aulasMes.filter(a => a.aluno_id === Number(filtroAluno));

  // 🔹 Ordenar por data
  const aulasOrdenadas = [...aulasFiltradas].sort(
    (a, b) => new Date(a.data_agendada) - new Date(b.data_agendada)
  );

  // 📊 Resumo mensal
      const totalAulas = aulasOrdenadas.length;

      const realizadas = aulasOrdenadas.filter(
        a => a.status === "realizada"
      ).length;

      const canceladasSemJust = aulasOrdenadas.filter(
        a => a.status === "cancelada_sem_justificativa"
      ).length;

      // 💰 Total financeiro do mês
      const totalFinanceiro = aulasOrdenadas
        .filter(a =>
          a.status === "realizada" ||
          a.status === "cancelada_sem_justificativa"
        )
        .reduce((acc, aula) => acc + (aula.valor_aula || 0), 0);
  
  
        return (
    <>
      <div className="pb-20 space-y-4">

        {/* 🔹 Filtro Mês */}
        <input
          type="month"
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(e.target.value)}
          className="w-full border rounded-lg p-2"
        />

        {/* 🔹 Filtro Aluno */}
        <select
          value={filtroAluno}
          onChange={(e) => setFiltroAluno(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          <option value="todos">Todos os alunos</option>
          {alunos.map(aluno => (
            <option key={aluno.id} value={aluno.id}>
              {aluno.nome}
            </option>
          ))}
        </select>

        
        
        {/* 🔹 Painel resumo mensal */}
<div className="grid grid-cols-2 gap-3">

<div className="bg-white rounded-xl shadow p-3 text-sm">
  <p className="text-gray-500">Aulas no mês</p>
  <p className="text-xl font-bold text-primary">
    {totalAulas}
  </p>
</div>

<div className="bg-white rounded-xl shadow p-3 text-sm">
  <p className="text-gray-500">Realizadas</p>
  <p className="text-xl font-bold text-green-600">
    {realizadas}
  </p>
</div>

<div className="bg-white rounded-xl shadow p-3 text-sm">
  <p className="text-gray-500">Cancel. s/ just.</p>
  <p className="text-xl font-bold text-red-600">
    {canceladasSemJust}
  </p>
</div>

<div className="bg-white rounded-xl shadow p-3 text-sm">
  <p className="text-gray-500">Total consumido</p>
  <p className="text-xl font-bold text-primary">
    R$ {totalFinanceiro.toFixed(2)}
  </p>
</div>

</div>
      

        {/* 🔹 Lista tipo tabela */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

          {/* Cabeçalho */}
          <div className="grid grid-cols-4 bg-gray-100 p-2 text-xs font-bold text-gray-600">
            <div>Data</div>
            <div>Hora</div>
            <div>Aluno</div>
            <div>Status</div>
          </div>

          {aulasOrdenadas.map(aula => (
            <div
              key={aula.id}
              className="grid grid-cols-4 items-center p-2 text-sm border-t"
            >
              <div>{formatarData(aula.data_agendada)}</div>
              <div>{formatarHora(aula.data_agendada)}</div>
              <div className="font-semibold text-primary">
                {aula.nome}
              </div>

              <div className="flex flex-col items-end gap-1">
                <select
                  value={aula.status}
                  onChange={(e) =>
                    atualizarStatus(aula.id, e.target.value)
                  }
                  className="text-xs border rounded p-1"
                >
                  <option value="agendada">Agendada</option>
                  <option value="realizada">Realizada</option>
                  <option value="cancelada_sem_justificativa">
                    Cancel. s/ just.
                  </option>
                  <option value="cancelada_com_justificativa">
                    Cancel. c/ just.
                  </option>
                  <option value="cancelada_pelo_professor">
                    Prof. cancelou
                  </option>
                </select>

                <button
                  onClick={() => {
                    setAulaSelecionada(aula);
                    setModalRemarcar(true);
                  }}
                  className="text-xs text-secondary"
                >
                  Remarcar
                </button>
              </div>
            </div>
          ))}

          {aulasOrdenadas.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Nenhuma aula encontrada para este período.
            </div>
          )}
        </div>
      </div>

      {/* Modal Remarcar */}
      <Modal
        aberto={modalRemarcar}
        fechar={() => setModalRemarcar(false)}
      >
        {aulaSelecionada && (
          <RemarcarAula
            aula={aulaSelecionada}
            fechar={() => setModalRemarcar(false)}
            atualizar={carregar}
          />
        )}
      </Modal>
    </>
  );
}

export default Agenda;