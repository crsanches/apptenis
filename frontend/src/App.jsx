import { useState, useEffect } from "react";
import Dashboard from "./screens/Dashboard";
import ExtratoAluno from "./screens/ExtratoAluno";
import ResumoProfessor from "./screens/ResumoProfessor";
import { useState, useEffect } from "react";
import { API_URL } from "./config";

function App() {

  const [pagamentos, setPagamentos] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/pagamentos`)
      .then(res => res.json())
      .then(data => setPagamentos(data))
      .catch(err => console.error("Erro ao buscar pagamentos:", err));
  }, []);

  const [tela, setTela] = useState(() => {
    return localStorage.getItem("tela") || "menu";
  });

  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  // 🔹 Garantir consistência se atualizar página
  useEffect(() => {
    if (tela === "extrato" && !alunoSelecionado) {
      setTela("controle");
      localStorage.setItem("tela", "controle");
    }
  }, [tela, alunoSelecionado]);

  const abrirExtrato = (aluno) => {
    setAlunoSelecionado(aluno);
    setTela("extrato");
    localStorage.setItem("tela", "extrato");
  };

  const voltarDashboard = () => {
    setTela("controle");
    setAlunoSelecionado(null);
    localStorage.setItem("tela", "controle");
  };

  const irParaMenu = () => {
    setTela("menu");
    localStorage.setItem("tela", "menu");
  };
  
  const irParaResumo = () => {
    setTela("resumo");
    localStorage.setItem("tela", "resumo");
  };
  
  const irParaControle = () => {
    setTela("controle");
    localStorage.setItem("tela", "controle");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-xl mx-auto">
  
      {/* 🔹 Header */}
      <div className="mb-6">

        <h1 className="text-2xl font-bold text-primary center">
                Controle de Aulas 🎾
        </h1>
        {tela !== "menu" && (
          <button
            onClick={
              tela === "extrato"
                ? irParaControle
                : irParaMenu
            }
            className="text-secondary text-sm mb-2"
          >
            ← Voltar
          </button>
        )}
  
        
  
      </div>
  
      {/* 🔹 Conteúdo */}
  
      {tela === "menu" && (
        <div className="space-y-6">
  
          <button
            onClick={irParaResumo}
            className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold"
          >
            📊 Resumo do Professor
          </button>
  
          <button
            onClick={irParaControle}
            className="w-full bg-green-600 text-white py-4 rounded-xl text-lg font-semibold"
          >
            🎾 Controle de Aulas
          </button>
  
        </div>
      )}
  
      {tela === "resumo" && (
  <ResumoProfessor
    pagamentos={pagamentos}
  />
)}
      
      {tela === "controle" && (
        <Dashboard abrirExtrato={abrirExtrato} />
      )}
  
      {tela === "extrato" && alunoSelecionado && (
        <ExtratoAluno aluno={alunoSelecionado} />
      )}
  
    </div>
  );
}

export default App;