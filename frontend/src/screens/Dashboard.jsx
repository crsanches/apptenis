import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import EditarAluno from "../components/EditarAluno";
import NovoAluno from "../components/NovoAluno";
import { API_URL } from "../config";
import { fetchAuth } from "../fetchAuth";

function Dashboard({ abrirExtrato }) {
  const [alunos, setAlunos] = useState([]);
  const [saldos, setSaldos] = useState({});
  const [modalEditar, setModalEditar] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  // 🔹 MÊS SELECIONADO (sem usar toISOString)
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");

  const [mesSelecionado, setMesSelecionado] = useState(
    `${ano}-${mes}`
  );

  // 🔹 Carregar alunos e saldos
  const carregar = async () => {
    try {
      setLoading(true);
  
      const data = await fetchAuth("/alunos");
      setAlunos(data);
  
      const saldosArray = await Promise.all(
        data.map(async (aluno) => {
  
          const saldoData = await fetchAuth(`/saldo/${aluno.id}`);
  
          return {
            id: aluno.id,
            saldo: saldoData.saldo
          };
  
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

  // 🔹 Carregar dashboard mensal
  useEffect(() => {

    fetchAuth(`/dashboard/${mesSelecionado}`)
      .then(data => setDashboard(data))
      .catch(err => console.error("Erro dashboard:", err));
  
  }, [mesSelecionado]);
  
  useEffect(() => {
    carregar();
  }, []);

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

        {/* 🔹 Seletor de Mês */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-600">
            Selecionar mês:
          </label>

          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>

        {/* 🔹 Painel Resumo */}
{dashboard && (
  <div className="grid grid-cols-2 gap-3">

    <div className="bg-white rounded-xl shadow p-3 text-sm">
      <p className="text-gray-500">Alunos</p>
      <p className="text-xl font-bold text-primary">
        {dashboard.total_alunos}
      </p>
    </div>

    <div className="bg-white rounded-xl shadow p-3 text-sm">
      <p className="text-gray-500">Créditos gerados no mês</p>
      <p className="text-xl font-bold text-green-600">
        {dashboard.creditos_gerados_mes ?? 0}
      </p>
    </div>

    <div className="bg-white rounded-xl shadow p-3 text-sm">
      <p className="text-gray-500">Créditos consumidos no mês</p>
      <p className="text-xl font-bold text-red-600">
        {dashboard.creditos_consumidos_mes ?? 0}
      </p>
    </div>

    <div className="bg-white rounded-xl shadow p-3 text-sm">
      <p className="text-gray-500">Créditos em aberto no mês</p>
      <p className="text-xl font-bold text-primary">
        {dashboard.creditos_abertos_mes ?? 0}
      </p>
    </div>

    <div className="bg-white rounded-xl shadow p-3 text-sm col-span-2">
      <p className="text-gray-500">Créditos acumulados totais</p>
      <p className="text-2xl font-bold text-blue-600">
        {dashboard.creditos_acumulados_total ?? 0}
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
                  Valor da aula:
                  <span className="font-semibold">
                    R$ {aluno.valor_aula}
                  </span>
                </p>

                <p
                  className={`text-lg font-bold mt-2 ${corSaldo(
                    saldo
                  )}`}
                >
                  Créditos disponíveis: {saldo}
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

                      await fetchAuth(
                        `/alunos/${aluno.id}`,
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