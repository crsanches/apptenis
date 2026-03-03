import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function ResumoProfessor({ voltar, pagamentos = [] }) {

  const [mesSelecionado, setMesSelecionado] = useState("");

  // ===============================
  // FILTRAR PAGAMENTOS POR MÊS
  // ===============================
  const pagamentosFiltrados = useMemo(() => {
    if (!mesSelecionado) return pagamentos;

    return pagamentos.filter(p =>
      p.data?.slice(0, 7) === mesSelecionado
    );
  }, [pagamentos, mesSelecionado]);

  // ===============================
  // TOTAL RECEBIDO (SEM STATUS)
  // ===============================
  const totalRecebido = useMemo(() => {
    return pagamentosFiltrados.reduce(
      (acc, p) => acc + Number(p.valor || 0),
      0
    );
  }, [pagamentosFiltrados]);

  // ===============================
  // DADOS PARA O GRÁFICO (POR MÊS)
  // ===============================
  const dadosGrafico = useMemo(() => {
    const mapa = {};

    pagamentos.forEach(p => {
      const mes = p.data?.slice(0, 7);
      if (!mes) return;

      if (!mapa[mes]) mapa[mes] = 0;
      mapa[mes] += Number(p.valor || 0);
    });

    return Object.keys(mapa)
      .sort()
      .map(mes => ({
        mes,
        valor: mapa[mes]
      }));
  }, [pagamentos]);

  // ===============================
  // RESUMO POR ALUNO
  // ===============================
  const resumoPorAluno = useMemo(() => {
    const mapa = {};

    pagamentosFiltrados.forEach(p => {
      const nome = p.aluno_nome || "Aluno";

      if (!mapa[nome]) mapa[nome] = 0;
      mapa[nome] += Number(p.valor || 0);
    });

    return Object.entries(mapa)
      .map(([aluno, total]) => ({
        aluno,
        total
      }))
      .sort((a, b) => b.total - a.total);
  }, [pagamentosFiltrados]);

  return (
    <div className="p-4">

      {/* BOTÃO VOLTAR */}
      <button
        onClick={voltar}
        className="text-secondary text-sm mb-4"
      >
      </button>

      <h2 className="text-xl font-bold mb-6">
        Resumo Financeiro do Professor
      </h2>

      {/* ===============================
          FILTRO POR MÊS
      =============================== */}
      <div className="mb-6">
        <label className="text-sm mr-2">Filtrar por mês:</label>
        <input
          type="month"
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      {/* ===============================
          TOTAL RECEBIDO
      =============================== */}
      <div className="bg-green-50 p-4 rounded-xl shadow mb-8">
        <p className="text-sm text-gray-500">
          Total Recebido {mesSelecionado && `( ${mesSelecionado} )`}
        </p>
        <p className="text-2xl font-bold text-green-600">
          R$ {totalRecebido.toFixed(2)}
        </p>
      </div>

      {/* ===============================
          GRÁFICO
      =============================== */}
      <div className="bg-white p-4 rounded-xl shadow mb-10">
        <h3 className="font-semibold mb-4">
          Ganhos por Mês
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dadosGrafico}>
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ===============================
          RESUMO POR ALUNO
      =============================== */}
      <div>
        <h3 className="font-semibold mb-4">
          Receita por Aluno
        </h3>

        {resumoPorAluno.length === 0 && (
          <p className="text-gray-500 text-sm">
            Nenhum pagamento registrado.
          </p>
        )}

        {resumoPorAluno.map((a, index) => (
          <div
            key={index}
            className="border-b py-3 flex justify-between"
          >
            <span className="font-medium">
              {a.aluno}
            </span>
            <span className="text-green-600 font-medium">
              R$ {a.total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default ResumoProfessor;