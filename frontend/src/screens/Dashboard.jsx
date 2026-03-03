import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import EditarAluno from "../components/EditarAluno";
import NovoAluno from "../components/NovoAluno";
import { API_URL } from "../config";

function Dashboard({ abrirExtrato }) {
  const [alunos, setAlunos] = useState([]);
  const [saldos, setSaldos] = useState({});
  const [modalEditar, setModalEditar] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  const carregar = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/alunos`);
      const data = await res.json();
      setAlunos(data);

      const saldosArray = await Promise.all(
        data.map(async (aluno) => {
          const r = await fetch(
            `${API_URL}/saldo/${aluno.id}`
          );
          const saldoData = await r.json();
          return { id: aluno.id, saldo: saldoData.saldo };
        })
      );

      const mapaSaldos = {};
      saldosArray.forEach((item) => {
        mapaSaldos[item.id] = item.saldo;
      });

      setSaldos(mapaSaldos);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/dashboard/${mesSelecionado}`)
      .then(res => res.json())
      .then(data => setDashboard(data));
  }, [mesSelecionado]);

  const corSaldo = (saldo) => {
    if (saldo > 0) return "text-green-600";
    if (saldo === 0) return "text-yellow-600";
    return "text-red-600";
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <>
      <div className="space-y-6 pb-20">

      {dashboard && (
  <div className="grid grid-cols-2 gap-3 mb-4">

    <div className="bg-white rounded-xl shadow p-3 text-sm">
      <p className="text-gray-500">Alunos</p>
      <p className="text-xl font-bold text-primary">
        {dashboard.total_alunos}
      </p>
    </div>

    <div className="bg-white rounded-xl shadow p-3 text-sm">
      <p className="text-gray-500">Aulas realizadas</p>
      <p className="text-xl font-bold text-green-600">
        {dashboard.total_realizadas}
      </p>
    </div>

    <div className="bg-white rounded-xl shadow p-3 text-sm">
      <p className="text-gray-500">Total recebido</p>
      <p className="text-xl font-bold text-green-600">
        R$ {dashboard.total_recebido.toFixed(2)}
      </p>
    </div>

    <div className="bg-white rounded-xl shadow p-3 text-sm">
      <p className="text-gray-500">Total a realizar</p>
      <p className="text-xl font-bold text-primary">
        R$ {dashboard.total_a_realizar.toFixed(2)}
      </p>
    </div>

  </div>
)}

        {/* 🔹 Botão Novo Aluno */}
        <div>
          <button
            onClick={() => setModalNovo(true)}
            className="bg-secondary text-white px-4 py-2 rounded"
          >
            ➕ Novo Aluno
          </button>
        </div>

        {loading && (
          <p className="text-gray-500 text-sm">
            Carregando alunos...
          </p>
        )}

        {!loading &&
          alunos.map((aluno) => {
            const saldo = saldos[aluno.id] ?? 0;

            return (
              <div
                key={aluno.id}
                className="bg-white rounded-2xl shadow p-4"
              >
                <h2 className="text-lg font-semibold text-primary">
                  {aluno.nome}
                </h2>

                <p className="text-sm text-gray-500">
                  Aulas mensais contratadas:{" "}
                  <span className="font-semibold">
                    {aluno.aulas_por_mes}
                  </span>
                </p>

                <p
                  className={`text-lg font-bold mt-2 ${corSaldo(
                    saldo
                  )}`}
                >
                  Saldo atual: {formatarMoeda(saldo)}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">

                  <button
                    onClick={() => abrirExtrato(aluno)}
                    className="bg-secondary text-white py-1 px-3 rounded text-sm"
                  >
                    📄 Ver Extrato
                  </button>

                  <button
                    onClick={() => {
                      setAlunoSelecionado(aluno);
                      setModalEditar(true);
                    }}
                    className="bg-gray-600 text-white py-1 px-3 rounded text-sm"
                  >
                    ✏️ Editar
                  </button>

                  <button
                    onClick={async () => {
                      if (!window.confirm("Excluir aluno?"))
                        return;

                      await fetch(
                        `${API_URL}/alunos/${aluno.id}`,
                        { method: "DELETE" }
                      );

                      carregar();
                    }}
                    className="bg-red-600 text-white py-1 px-3 rounded text-sm"
                  >
                    🗑 Excluir
                  </button>

                </div>
              </div>
            );
          })}
      </div>

      {/* 🔹 Modal Editar */}
      <Modal
        aberto={modalEditar}
        fechar={() => setModalEditar(false)}
      >
        {alunoSelecionado && (
          <EditarAluno
            aluno={alunoSelecionado}
            fechar={() => setModalEditar(false)}
            atualizar={carregar}
          />
        )}
      </Modal>

      {/* 🔹 Modal Novo Aluno */}
      <Modal
        aberto={modalNovo}
        fechar={() => setModalNovo(false)}
      >
        <NovoAluno
          fechar={() => setModalNovo(false)}
          atualizar={carregar}
        />
      </Modal>
    </>
  );
}

export default Dashboard;