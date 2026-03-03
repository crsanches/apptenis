import { useState, useEffect } from "react";
import Dashboard from "./screens/Dashboard";
import ExtratoAluno from "./screens/ExtratoAluno";

function App() {
  const [tela, setTela] = useState(() => {
    return localStorage.getItem("tela") || "dashboard";
  });

  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  // 🔹 Garantir consistência se atualizar página
  useEffect(() => {
    if (tela === "extrato" && !alunoSelecionado) {
      setTela("dashboard");
      localStorage.setItem("tela", "dashboard");
    }
  }, [tela, alunoSelecionado]);

  const abrirExtrato = (aluno) => {
    setAlunoSelecionado(aluno);
    setTela("extrato");
    localStorage.setItem("tela", "extrato");
  };

  const voltarDashboard = () => {
    setTela("dashboard");
    setAlunoSelecionado(null);
    localStorage.setItem("tela", "dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-xl mx-auto">

      {/* Header */}
      <div className="mb-6">

        {tela === "extrato" && (
          <button
            onClick={voltarDashboard}
            className="text-secondary text-sm mb-2"
          >
            ← Voltar
          </button>
        )}

        <h1 className="text-2xl font-bold text-primary">
          Controle de Aulas 🎾
        </h1>

      </div>

      {/* Renderização das telas */}
      {tela === "dashboard" && (
        <Dashboard abrirExtrato={abrirExtrato} />
      )}

      {tela === "extrato" && alunoSelecionado && (
        <ExtratoAluno aluno={alunoSelecionado} />
      )}

    </div>
  );
}

export default App;