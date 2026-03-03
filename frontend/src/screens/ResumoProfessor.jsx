import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function ResumoProfessor({ voltar, aulas = [], pagamentos = [] }) {

  const [mesSelecionado, setMesSelecionado] = useState("");

  // ---------- FILTRAR POR MÊS ----------
  const pagamentosFiltrados = useMemo(() => {
    if (!mesSelecionado) return pagamentos;

    return pagamentos.filter(p => {
      const mesPagamento = p.data.slice(0, 7); // YYYY-MM
      return mesPagamento === mesSelecionado;
    });
  }, [pagamentos, mesSelecionado]);

  // ---------- TOTAIS ----------
  const totalRecebido = pagamentosFiltrados
    .filter(p => p.status === "pago")
    .reduce((acc, p) => acc + Number(p.valor), 0);

  const totalPendente = pagamentosFiltrados
    .filter(p => p.status === "pendente")
    .reduce((acc, p) => acc + Number(p.valor), 0);

  // ---------- GRÁFICO POR MÊS ----------
  const dadosGrafico = useMemo(() => {
    const mapa = {};

    pagamentos.forEach(p => {
      const mes = p.data.slice(0, 7);

      if (!mapa[mes]) mapa[mes] = 0;

      if (p.status === "pago") {
        mapa[mes] += Number(p.valor);
      }
    });

    return Object.keys(mapa).map(mes => ({
      mes,
      valor: mapa[mes]
    }));
  }, [pagamentos]);

  // ---------- RESUMO POR ALUNO ----------
  const resumoPorAluno = useMemo(() => {
    const mapa = {};

    pagamentosFiltrados.forEach(p => {
      if (!mapa[p.aluno]) {
        mapa[p.aluno] = {
          total: 0,
          recebido: 0,
          pendente: 0
        };
      }

      mapa[p.aluno].total += Number(p.valor);

      if (p.status === "pago") {
        mapa[p.aluno].recebido += Number(p.valor);
      } else {
        mapa[p.aluno].pendente += Number(p.valor);
      }
    });

    return Object.entries(mapa).map(([aluno, dados]) => ({
      aluno,
      ...dados
    }));
  }, [pagamentosFiltrados]);

  return (
    <div className="p-4">

      <button onClick={voltar} className="text-secondary text-sm mb-4">
        ← Voltar
      </button>

      <h2 className="text-xl font-bold mb-4">
        Resumo do Professor
      </h2>

      {/* FILTRO */}
      <div className="mb-6">
        <label className="text-sm mr-2">Filtrar por mês:</label>
        <input
          type="month"
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      {/* TOTAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        <div className="bg-green-50 p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Recebido</p>
          <p className="text-xl font-bold text-green-600">
            R$ {totalRecebido.toFixed(2)}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Total Pendente</p>
          <p className="text-xl font-bold text-red-600">
            R$ {totalPendente.toFixed(2)}
          </p>
        </div>

      </div>

      {/* GRÁFICO */}
      <div className="bg-white p-4 rounded-xl shadow mb-8">
        <h3 className="font-semibold mb-4">Ganhos por Mês</h3>

        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={dadosGrafico}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RESUMO POR ALUNO */}
      <div>
        <h3 className="font-semibold mb-4">Resumo por Aluno</h3>

        {resumoPorAluno.length === 0 && (
          <p className="text-gray-500 text-sm">
            Nenhum registro encontrado.
          </p>
        )}

        {resumoPorAluno.map((a, index) => (
          <div
            key={index}
            className="border-b py-3 flex flex-col md:flex-row md:justify-between"
          >
            <span className="font-medium">{a.aluno}</span>

            <div className="text-sm mt-1 md:mt-0">
              <span className="mr-4">
                Total: R$ {a.total.toFixed(2)}
              </span>
              <span className="text-green-600 mr-4">
                Recebido: R$ {a.recebido.toFixed(2)}
              </span>
              <span className="text-red-600">
                Pendente: R$ {a.pendente.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default ResumoProfessor;