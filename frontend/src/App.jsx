import { useState, useEffect } from "react";
import Dashboard from "./screens/Dashboard";
import ExtratoAluno from "./screens/ExtratoAluno";
import ResumoProfessor from "./screens/ResumoProfessor";
import { API_URL } from "./config";

function App() {

  // ===============================
  // ESTADOS
  // ===============================
  const [tela, setTela] = useState("menu"); // 🔥 Sempre começa no menu
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);

  // ===============================
  // BUSCAR PAGAMENTOS
  // ===============================
  const carregarPagamentos = () => {
    fetch(`${API_URL}/pagamentos`)
      .then(res => res.json())
      .then(data => setPagamentos(data))
      .catch(err => console.error("Erro ao buscar pagamentos:", err));
  };

  useEffect(() => {
    carregarPagamentos();
  }, []);

  // ===============================
  // NAVEGAÇÃO
  // ===============================
  const abrirExtrato = (aluno) => {
    setAlunoSelecionado(aluno);
    setTela("extrato");
  };

  const irParaMenu = () => {
    setTela("menu");
    setAlunoSelecionado(null);
  };

  const irParaResumo = () => {
    carregarPagamentos(); // 🔥 Atualiza antes de abrir
    setTela("resumo");
  };

  const irParaControle = () => {
    setTela("controle");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-xl mx-auto">

      {/* ===============================
          HEADER
      =============================== */}
      <div className="mb-6">

        <h1 className="text-2xl font-bold text-primary text-center">
          Controle de Aulas 🎾
        </h1>

        {tela !== "menu" && (
          <button
            onClick={irParaMenu}
            className="text-secondary text-sm mt-2"
          >
            ← Voltar
          </button>
        )}

      </div>

      {/* ===============================
          MENU
      =============================== */}
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

      {/* ===============================
          RESUMO
      =============================== */}
      {tela === "resumo" && (
        <ResumoProfessor pagamentos={pagamentos} />
      )}

      {/* ===============================
          CONTROLE
      =============================== */}
      {tela === "controle" && (
        <Dashboard abrirExtrato={abrirExtrato} />
      )}

      {/* ===============================
          EXTRATO
      =============================== */}
      {tela === "extrato" && alunoSelecionado && (
        <ExtratoAluno aluno={alunoSelecionado} />
      )}

    </div>
  );
}

export default App;