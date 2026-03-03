function ResumoProfessor({ voltar }) {
    return (
      <div>
        <button
          onClick={voltar}
          className="text-secondary text-sm mb-4"
        >
          ← Voltar
        </button>
  
        <h2 className="text-xl font-bold">
          Resumo do Professor
        </h2>
      </div>
    );
  }
  
  export default ResumoProfessor;