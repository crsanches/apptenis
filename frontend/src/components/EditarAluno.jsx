import { useState } from "react";
import { API_URL } from "../config";
import { fetchAuth } from "../fetchAuth";

function EditarAluno({ aluno, fechar, atualizar }) {
  const [nome, setNome] = useState(aluno.nome);
  const [valorAula, setValorAula] = useState(aluno.valor_aula);

  const salvar = async () => {

    await fetchAuth(`/alunos/${aluno.id}`, {
      method: "PUT",
      body: JSON.stringify({
        nome,
        valor_aula: Number(valorAula)
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

      <div>
        <label className="block text-sm font-medium mb-1">
          Nome do aluno
        </label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Valor por aula (R$)
        </label>
        <input
          type="number"
          className="w-full border rounded p-2"
          value={valorAula}
          onChange={e => setValorAula(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={fechar}
          className="w-1/2 border py-2 rounded"
        >
          Cancelar
        </button>

        <button
          onClick={salvar}
          className="w-1/2 bg-primary text-white py-2 rounded"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

export default EditarAluno;