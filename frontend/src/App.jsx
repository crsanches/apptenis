import { useState, useEffect } from "react";
import Dashboard from "./screens/Dashboard";
import ExtratoAluno from "./screens/ExtratoAluno";
import ResumoProfessor from "./screens/ResumoProfessor";
import { API_URL } from "./config";
import Login from "./screens/Login.jsx";
import { getToken, logout } from "./auth";
import Usuarios from "./screens/Usuarios";

function App() {

  // ===============================
  // ESTADOS
  // ===============================

  const [tela, setTela] = useState("menu");
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [pagamentos, setPagamentos] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [usuario,setUsuario] = useState(null);

  const irParaUsuarios = () => {
    setTela("usuarios");
  };

  // ===============================
  // RESTAURAR LOGIN
  // ===============================

  useEffect(() => {

    const token = getToken();

    if(token){

      try{

        const payload = JSON.parse(atob(token.split(".")[1]));

        setUsuario({
          nome: payload.nome,
          perfil: payload.perfil
        });

      }catch{
        logout();
      }

    }

  }, []);

  // ===============================
  // BUSCAR PAGAMENTOS
  // ===============================

  const carregarPagamentos = () => {

    fetch(`${API_URL}/pagamentos`,{
      headers:{
        Authorization:`Bearer ${getToken()}`
      }
    })
      .then(res => res.json())
      .then(data => setPagamentos(data))
      .catch(err => console.error("Erro ao buscar pagamentos:", err));

  };

  // ===============================
  // BUSCAR AULAS
  // ===============================

  const carregarAulas = () => {

    fetch(`${API_URL}/aulas`,{
      headers:{
        Authorization:`Bearer ${getToken()}`
      }
    })
      .then(res => res.json())
      .then(data => setAulas(data))
      .catch(err => console.error("Erro ao buscar aulas:", err));

  };

  // ===============================
  // CARREGAR DADOS APÓS LOGIN
  // ===============================

  useEffect(() => {

    if(usuario){
      carregarPagamentos();
      carregarAulas();
    }

  }, [usuario]);

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
    carregarPagamentos();
    carregarAulas();
    setTela("resumo");
  };

  const irParaControle = () => {
    setTela("controle");
  };

  // ===============================
  // LOGIN
  // ===============================

  if (!usuario) {
    return <Login setUsuario={setUsuario} />;
  }

  // ===============================
  // APP PRINCIPAL
  // ===============================

  return (

    <div className="min-h-screen bg-gray-50 p-4 max-w-xl mx-auto">

      {/* HEADER */}

      <div className="mb-6 flex justify-between items-center">

        <h1 className="text-2xl font-bold text-primary">
          Controle de Aulas 🎾
        </h1>

        <div className="flex items-center gap-3">

          <span className="text-sm text-gray-600">
            👤 {usuario.nome}
          </span>

          <button
            onClick={()=>{
              logout();
              window.location.reload();
            }}
            className="text-red-600 text-sm"
          >
            Logout
          </button>

        </div>

      </div>

      {tela !== "menu" && (
        <button
          onClick={irParaMenu}
          className="text-secondary text-sm mb-4"
        >
          ← Voltar
        </button>
      )}

      {/* MENU */}

      {tela === "menu" && (

        <div className="space-y-6">

          {usuario.perfil === "admin" && (

            <button
              onClick={irParaUsuarios}
              className="w-full bg-purple-600 text-white py-4 rounded-xl text-lg font-semibold"
            >
              👥 Gerenciar Usuários
            </button>

          )}

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

      {/* RESUMO */}

      {tela === "resumo" && (
        <ResumoProfessor
          pagamentos={pagamentos}
          aulas={aulas}
        />
      )}

      {/* CONTROLE */}

      {tela === "controle" && (
        <Dashboard abrirExtrato={abrirExtrato} />
      )}

      {/* EXTRATO */}

      {tela === "extrato" && alunoSelecionado && (
        <ExtratoAluno aluno={alunoSelecionado} />
      )}

      {/* USUÁRIOS */}

      {tela === "usuarios" && (
        <Usuarios voltar={irParaMenu}/>
      )}

    </div>

  );

}

export default App;