import { useState } from "react";
import { API_URL } from "../config";

function EditarAluno({ aluno, fechar, atualizar }) {
  const [nome, setNome] = useState(aluno.nome);
  const [valor, setValor] = useState(aluno.valor_mensal);
  const [aulas, setAulas] = useState(aluno.aulas_por_mes);

  const salvar = async () => {
    await fetch(`${API_URL}/alunos/${aluno.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        valor_mensal: Number(valor),
        aulas_por_mes: Number(aulas)
      })
    });

    fechar();
    atualizar();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-primary">
        Editar Aluno
      </h2>

      <input
        className="w-full border rounded p-2"
        value={nome}
        onChange={e => setNome(e.target.value)}
      />

      <input
        type="number"
        className="w-full border rounded p-2"
        value={valor}
        onChange={e => setValor(e.target.value)}
      />

      <input
        type="number"
        className="w-full border rounded p-2"
        value={aulas}
        onChange={e => setAulas(e.target.value)}
      />

      <button
        onClick={salvar}
        className="w-full bg-primary text-white py-2 rounded"
      >
        Salvar
      </button>
    </div>
  );
}

export default EditarAluno;