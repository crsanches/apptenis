import { useState, useEffect } from "react";
import { API_URL } from "../config";
import { getToken } from "../auth";
import { fetchAuth } from "../fetchAuth";

function Usuarios({ voltar }) {

  const [usuarios,setUsuarios] = useState([]);
  const [nome,setNome] = useState("");
  const [email,setEmail] = useState("");
  const [senha,setSenha] = useState("");
  const [perfil,setPerfil] = useState("usuario");

  // ===============================
  // CARREGAR USUÁRIOS
  // ===============================

  const carregarUsuarios = async () => {

    const data = await fetchAuth("/usuarios");
  
    if(Array.isArray(data)){
      setUsuarios(data);
    }
  
  };

  useEffect(()=>{
    carregarUsuarios();
  },[]);

  // ===============================
  // CRIAR USUÁRIO
  // ===============================

  const criarUsuario = async () => {

    await fetchAuth("/usuarios",{
      method:"POST",
      body:JSON.stringify({
        nome,
        email,
        senha,
        perfil
      })
    });

    setNome("");
    setEmail("");
    setSenha("");

    carregarUsuarios();

  };

  // ===============================
  // DELETAR USUÁRIO
  // ===============================

  const deletarUsuario = async (id) => {

    await fetchAuth(`/usuarios/${id}`,{
      method:"DELETE"
    });

    carregarUsuarios();

  };

  return (

    <div>

      <button
        onClick={voltar}
        className="text-secondary text-sm mb-4"
      >
        ← Voltar
      </button>

      <h2 className="text-xl font-bold mb-4">
        👥 Gerenciar Usuários
      </h2>

      {/* CRIAR USUÁRIO */}

      <div className="space-y-2 mb-6">

        <input
          placeholder="Nome"
          value={nome}
          onChange={e=>setNome(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e=>setSenha(e.target.value)}
          className="border p-2 w-full"
        />

        <select
          value={perfil}
          onChange={e=>setPerfil(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="usuario">Usuário</option>
          <option value="admin">Administrador</option>
        </select>

        <button
          onClick={criarUsuario}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Criar usuário
        </button>

      </div>

      {/* LISTA */}

      <div className="space-y-2">

        {usuarios.map(u => (

          <div
            key={u.id}
            className="flex justify-between border p-2 rounded"
          >

            <div>
              <b>{u.nome}</b><br/>
              <span className="text-sm">{u.email}</span><br/>
              <span className="text-xs">{u.perfil}</span>
            </div>

            <button
              onClick={()=>deletarUsuario(u.id)}
              className="text-red-600"
            >
              🗑
            </button>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Usuarios;