import { useState } from "react";
import { API_URL } from "../config";
import { setToken } from "../auth";

function Login({ setUsuario }) {

  const [email,setEmail] = useState("");
  const [senha,setSenha] = useState("");
  const [erro,setErro] = useState("");
  const [loading,setLoading] = useState(false);

  const entrar = async () => {

    if(!email || !senha){
      setErro("Informe email e senha");
      return;
    }

    try{

      setErro("");
      setLoading(true);

      const res = await fetch(`${API_URL}/login`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({email,senha})
      });

      const data = await res.json();

      if(!res.ok){
        setErro(data.erro || "Erro no login");
        setLoading(false);
        return;
      }

      if(!data.token){
        setErro("Token não recebido");
        setLoading(false);
        return;
      }

      setToken(data.token);
      setUsuario(data.usuario);

    }catch(err){

      console.error(err);
      setErro("Erro ao conectar com servidor");

    }finally{

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">

        <h1 className="text-2xl font-bold text-center mb-2">
        🎾Controle de Aulas 🎾
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Acesse sua conta
        </p>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            onKeyDown={(e)=> e.key === "Enter" && entrar()}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e=>setSenha(e.target.value)}
            onKeyDown={(e)=> e.key === "Enter" && entrar()}
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={entrar}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {erro && (
            <p className="text-red-500 text-sm text-center">
              {erro}
            </p>
          )}

        </div>

      </div>

    </div>

  );

}

export default Login;