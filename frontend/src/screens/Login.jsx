import { useState } from "react";
import { API_URL } from "../config";
import { setToken } from "../auth";

function Login({ setUsuario }) {

  const [email,setEmail] = useState("");
  const [senha,setSenha] = useState("");
  const [erro,setErro] = useState("");

  const entrar = async ()=>{

    try{

      const res = await fetch(`${API_URL}/login`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({email,senha})
      });

      const data = await res.json();

      if(!res.ok){
        setErro(data.erro);
        return;
      }

      setToken(data.token);
      setUsuario(data.usuario);

    }catch(err){
      console.error(err);
      setErro("Erro ao conectar com servidor");
    }

  };

  return(

    <div style={{padding:20}}>

      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={e=>setEmail(e.target.value)}
      />

      <br/><br/>

      <input
        type="password"
        placeholder="Senha"
        onChange={e=>setSenha(e.target.value)}
      />

      <br/><br/>

      <button onClick={entrar}>
        Entrar
      </button>

      {erro && (
        <p style={{color:"red"}}>
          {erro}
        </p>
      )}

    </div>

  );

}

export default Login;