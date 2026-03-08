import { useState, useEffect } from "react";
import { fetchAuth } from "../fetchAuth";

function Usuarios({ voltar }) {

  const [usuarios, setUsuarios] = useState([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("usuario");
  const [editandoId, setEditandoId] = useState(null);

  // ===============================
  // CARREGAR USUÁRIOS
  // ===============================

  const carregarUsuarios = async () => {

    const data = await fetchAuth("/usuarios");

    if (Array.isArray(data)) {
      setUsuarios(data);
    }

  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // ===============================
  // LIMPAR FORMULÁRIO
  // ===============================

  const limparFormulario = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setPerfil("usuario");
    setEditandoId(null);
  };

  // ===============================
  // SALVAR USUÁRIO (CRIAR OU EDITAR)
  // ===============================

  const salvarUsuario = async () => {

    const body = {
      nome,
      email,
      perfil
    };

    if (senha) {
      body.senha = senha;
    }

    if (editandoId) {

      await fetchAuth(`/usuarios/${editandoId}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });

    } else {

      await fetchAuth("/usuarios", {
        method: "POST",
        body: JSON.stringify({
          nome,
          email,
          senha,
          perfil
        })
      });

    }

    limparFormulario();
    carregarUsuarios();

  };

  // ===============================
  // EDITAR USUÁRIO
  // ===============================

  const editarUsuario = (u) => {

    setNome(u.nome);
    setEmail(u.email);
    setPerfil(u.perfil);
    setSenha("");

    setEditandoId(u.id);

  };

  // ===============================
  // DELETAR USUÁRIO
  // ===============================

  const deletarUsuario = async (id) => {

    if (!confirm("Excluir usuário?")) return;

    await fetchAuth(`/usuarios/${id}`, {
      method: "DELETE"
    });

    carregarUsuarios();

  };

  // ===============================
  // INTERFACE
  // ===============================

  return (

    <div>

      <button
        onClick={voltar}
        className="text-secondary text-sm mb-4"
      >
      </button>

      <h2 className="text-xl font-bold mb-4">
        👥 Gerenciar Usuários
      </h2>

      {/* FORMULÁRIO */}

      <div className="space-y-2 mb-6">

        <input
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="border p-2 w-full"
        />

        <select
          value={perfil}
          onChange={e => setPerfil(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="usuario">Usuário</option>
          <option value="admin">Administrador</option>
        </select>

        <div className="flex gap-2">

          <button
            onClick={salvarUsuario}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editandoId ? "Salvar alterações" : "Criar usuário"}
          </button>

          {editandoId && (
            <button
              onClick={limparFormulario}
              className="px-4 py-2 border rounded"
            >
              Cancelar
            </button>
          )}

        </div>

      </div>

      {/* LISTA DE USUÁRIOS */}

      <div className="space-y-2">

        {usuarios.map(u => (

          <div
            key={u.id}
            className="flex justify-between items-center border p-2 rounded"
          >

            <div>
              <b>{u.nome}</b><br />
              <span className="text-sm">{u.email}</span><br />
              <span className="text-xs">{u.perfil}</span>
            </div>

            <div className="flex gap-3">

              <button
                onClick={() => editarUsuario(u)}
                className="text-blue-600"
              >
                ✏️
              </button>

              <button
                onClick={() => deletarUsuario(u.id)}
                className="text-red-600"
              >
                🗑
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

export default Usuarios;