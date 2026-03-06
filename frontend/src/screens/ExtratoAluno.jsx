import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import NovoPagamento from "../components/NovoPagamento";
import AgendarAula from "../components/AgendarAula";
import { fetchAuth } from "../fetchAuth";


function ExtratoAluno({ aluno }) {
  const [extrato, setExtrato] = useState([]);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [modalAula, setModalAula] = useState(false);
  const [loading, setLoading] = useState(false);
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");

  const [mesSelecionado, setMesSelecionado] = useState(
    `${ano}-${mes}`
  );

  const carregarExtrato = async () => {
    if (!aluno) return;
  
    setLoading(true);
  
    try {
  
      const data = await fetchAuth(`/extrato/${aluno.id}`);
  
      if (Array.isArray(data)) {
        setExtrato(data);
      } else {
        setExtrato([]);
      }
  
    } catch (err) {
      console.error("Erro ao carregar extrato:", err);
      setExtrato([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarExtrato();
  }, [aluno]);

  const formatarMoeda = (valor) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarNumero = (valor) => {
    return (valor ?? 0).toLocaleString("pt-BR");
  };

  const corLinha = (item) => {
    if (item.tipo === "pagamento") {
      return "bg-green-50";
    }
  
    switch (item.status) {
      case "realizada":
        return "bg-green-50";
  
      case "cancelada_sem_justificativa":
        return "bg-red-50";
  
      case "agendada":
        return "bg-yellow-50";
  
      case "cancelada_com_justificativa":
        return "bg-blue-50";
  
      case "cancelada_pelo_professor":
        return "bg-purple-50";
  
      default:
        return "";
    }
  };
  const iconeStatus = (item) => {
    if (item.tipo === "pagamento") return "💰";
  
    switch (item.status) {
      case "realizada":
        return "🎾";
      case "agendada":
        return "🗓";
      case "cancelada_sem_justificativa":
        return "❌";
      case "cancelada_com_justificativa":
        return "ℹ️";
      case "cancelada_pelo_professor":
        return "👨‍🏫";
      default:
        return "";
    }
  };

  const saldoAtual =
    extrato.length > 0
      ? extrato[extrato.length - 1].saldo
      : 0;

      const movimentosMes = extrato.filter((item) =>
        item.data_evento &&
        item.data_evento.startsWith(mesSelecionado)
      );

      const totalPagoMes = movimentosMes
      .filter((i) => i.tipo === "pagamento")
      .reduce((acc, i) => acc + Number(i.valor || 0), 0);
      
      const totalConsumidoMes = movimentosMes
      .filter(
        (i) =>
          i.tipo === "aula" &&
          (i.status === "realizada" ||
            i.status === "cancelada_sem_justificativa")
      )
      .reduce((acc) => acc + Number(aluno.valor_aula || 0), 0);

      const totalAulasMes = movimentosMes.filter(
        (i) =>
          i.tipo === "aula" &&
          (i.status === "realizada" ||
          i.status === "cancelada_sem_justificativa")
      ).length;

      const totalCreditosMes = movimentosMes
        .filter((i) => i.tipo === "pagamento")
        .reduce((acc, i) => acc + Number(i.quantidade || 0), 0);

      const totalDebitosMes = movimentosMes
        .filter(
          (i) =>
            i.tipo === "aula" &&
            (i.status === "realizada" ||
              i.status === "cancelada_sem_justificativa")
        )
        .length;

      const saldoAulasMes = totalCreditosMes - totalDebitosMes;

  return (
    <>
      <div className="pb-20 space-y-4">

        {/* 🔹 Título */}
        <h2 className="text-xl font-bold text-primary">
          Extrato - {aluno.nome}
        </h2>

        {/* 🔹 Botões */}
        <div className="flex gap-3 flex-wrap">

          <button
            onClick={() => setModalPagamento(true)}
            className="bg-secondary text-white px-4 py-2 rounded"
          >
            ➕ Registrar Pagamento
          </button>

          <button
            onClick={() => setModalAula(true)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            ➕ Agendar Aula
          </button>

        </div>

        {/* 🔹 Saldo Atual */}
        <div
          className={`text-lg font-bold ${
            saldoAtual >= 0
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          Saldo atual: {formatarNumero(saldoAtual)}
        </div>


        <div className="bg-white rounded-xl shadow p-4 space-y-2">

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

<h3 className="font-semibold text-sm text-gray-600">
  Resumo de {mesSelecionado}
</h3>

  <div className="grid grid-cols-2 gap-2 text-sm">

    <div>
      💰 Pago:
      <span className="font-semibold ml-1">
        {formatarMoeda(totalPagoMes)}
      </span>
    </div>

    <div>
      🎾 Consumido:
      <span className="font-semibold ml-1">
        {formatarMoeda(totalConsumidoMes)}
      </span>
    </div>

    <div>
      📊 Aulas utilizadas:
      <span className="font-semibold ml-1">
        {totalAulasMes}
      </span>
    </div>

    <div>
      🧮 Saldo:
      <span className="font-semibold ml-1">
      {formatarNumero(saldoAulasMes)}
      </span>
    </div>

  </div>
</div>


        {/* 🔹 Tabela */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="grid grid-cols-[0.8fr_1.0fr_0.9fr_0.9fr_0.9fr_0.1fr] bg-gray-100 p-1 text-[14px] font-semibold">
        <div>Data</div>
        <div>Tipo</div>
        <div>Débito</div>
        <div>Crédito</div>
        <div>Saldo</div>
        <div></div>
      </div>

          {loading && (
            <div className="p-4 text-sm text-gray-500">
              Carregando...
            </div>
          )}

{!loading && extrato.map(item => (
  <div
    key={`${item.tipo}-${item.id}`}
    className={`grid grid-cols-[0.8fr_1.3fr_0.9fr_0.9fr_0.9fr_0.4fr] px-2 py-0.5 text-[10px] border-t items-center ${corLinha(item)}`}
  >
    {/* 🔹 Data */}
    <div>
        {item.data_evento
      ? (() => {
          const data = item.data_evento.split("T")[0];
          const [ano, mes, dia] = data.split("-");
          return `${dia}/${mes}/${ano}`;
        })()
      : "-"}
    </div>

    {/* 🔹 Tipo + Ícone */}
    <div className="flex items-center gap-1">
      <span>{iconeStatus(item)}</span>

      {item.tipo === "pagamento" ? (
        <span>Pagamento</span>
      ) : (
        <select
          value={item.status}
          onChange={async (e) => {
            await fetchAuth(
              `/aulas/${item.id}/status`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  status: e.target.value,
                }),
              }
            );
            carregarExtrato();
          }}
          className="text-[9px] bg-white rounded px-2 py-[2px] shadow-sm w-[110px]"
        >
          <option value="agendada">Agendada</option>
          <option value="realizada">Realizada</option>
          <option value="cancelada_sem_justificativa">
            Canc.s/just
          </option>
          <option value="cancelada_com_justificativa">
            Canc.c/just
          </option>
          <option value="cancelada_pelo_professor">
            Canc.Prof
          </option>
        </select>
      )}
    </div>

    {/* 🔹 Débito */}
    <div className="text-red-600 text-center">
      {item.debito ? formatarNumero(item.debito) : "-"}
    </div>

    {/* 🔹 Crédito */}
    <div className="text-green-600 text-center">
      {item.credito ? formatarNumero(item.credito) : "-"}
    </div>

    {/* 🔹 Saldo */}
        <div
      className={`text-right ${
        item.saldo >= 0
          ? "text-green-600 font-semibold"
          : "text-red-600 font-semibold"
      }`}
    >
      {formatarNumero(item.saldo)}
    </div>

    {/* 🔹 Excluir */}
    <div className="flex justify-end">
      <button
        onClick={async () => {
          if (!window.confirm("Excluir lançamento?")) return;

          if (item.tipo === "pagamento") {
            await fetchAuth(
              `/pagamentos/${item.id}`,
              { method: "DELETE" }
            );
          } else {
            await fetchAuth(
              `/aulas/${item.id}`,
              { method: "DELETE" }
            );
          }

          carregarExtrato();
        }}
        className="text-red-500 text-xs"
      >
        🗑
      </button>
    </div>

  </div>
))}

          {!loading && extrato.length === 0 && (
            <div className="p-4 text-sm text-gray-500">
              Nenhum movimento encontrado.
            </div>
          )}

        </div>
      </div>

      {/* 🔹 Modal Pagamento */}
      <Modal
        aberto={modalPagamento}
        fechar={() => setModalPagamento(false)}
      >
        <NovoPagamento
          aluno={aluno}
          fechar={() => setModalPagamento(false)}
          atualizar={carregarExtrato}
        />
      </Modal>

      {/* 🔹 Modal Aula */}
      <Modal
        aberto={modalAula}
        fechar={() => setModalAula(false)}
      >
        <AgendarAula
          aluno={aluno}
          fechar={() => setModalAula(false)}
          atualizar={carregarExtrato}
        />
      </Modal>
    </>
  );
}

export default ExtratoAluno;