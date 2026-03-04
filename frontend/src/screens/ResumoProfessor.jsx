import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function ResumoProfessor({ voltar, pagamentos = [], aulas = [] }) {

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
  // FILTRAR AULAS POR MÊS
  // ===============================
    const aulasFiltradas = useMemo(() => {
      if (!mesSelecionado) return aulas;

      return aulas.filter(a =>
        a.data?.slice(0, 7) === mesSelecionado
      );
    }, [aulas, mesSelecionado]);

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
  
      if(!mapa[nome]){
  
        mapa[nome] = {
          aluno: nome,
          receita: 0,
          creditos: 0,
          realizadas: 0,
          aRealizar: 0
        };
  
      }
  
      mapa[nome].receita += Number(p.valor || 0);
      mapa[nome].creditos += Number(p.creditos_gerados || 0);
  
    });
  
    aulasFiltradas.forEach(a => {

      const nome = a.aluno_nome;
      console.log("AULAS:", aulas);
      console.log("PAGAMENTOS:", pagamentos);
      if (!mapa[nome]) return;
    
      if (a.status?.toLowerCase() === "realizada") {
        mapa[nome].realizadas += 1;
      } else {
        mapa[nome].aRealizar = (mapa[nome].aRealizar || 0) + 1;
      }
    
    });
  
    return Object.values(mapa)
      .map(a => ({
        ...a,
        saldo: a.creditos - a.realizadas
      }))
      .sort((a,b) => b.receita - a.receita);
  
  }, [pagamentosFiltrados, aulasFiltradas]);

  return (
    <div className="p-4">

      {/* BOTÃO VOLTAR */}
      <button
        onClick={voltar}
        className="text-secondary text-sm mb-4"
      >
      ← Voltar
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
        R$ {Number(totalRecebido || 0).toFixed(2)}
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
    Resumo por Aluno
  </h3>

  <table className="w-full text-sm">

    <thead>
      <tr className="border-b text-gray-600">
        <th className="text-left py-2">Aluno</th>
        <th>Créditos</th>
        <th>Realizadas</th>
        <th>A realizar</th>
        <th className="text-right">Receita</th>
      </tr>
    </thead>

    <tbody>

      {resumoPorAluno.map((a, index) => (

        <tr key={index} className="border-b">

          <td className="py-2 font-medium">
            {a.aluno}
          </td>

          <td className="text-center">
            {a.creditos}
          </td>

          <td className="text-center">
            {a.realizadas}
          </td>

          <td className="text-center">
            {a.aRealizar}
          </td>

          <td className="text-right text-green-600 font-medium">
          R$ {Number(a.receita || 0).toFixed(2)}
          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

    </div>
  );
}

export default ResumoProfessor;