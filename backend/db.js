const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL
    ? { rejectUnauthorized: false }
    : false
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL conectado"))
  .catch(err => console.error("❌ Erro ao conectar:", err));

  async function criarTabelas() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS alunos (
          id SERIAL PRIMARY KEY,
          nome TEXT NOT NULL,
          valor_aula NUMERIC NOT NULL
        );
      `);
  
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pagamentos (
          id SERIAL PRIMARY KEY,
          aluno_id INTEGER REFERENCES alunos(id),
          valor NUMERIC NOT NULL,
          data DATE NOT NULL,
          valor_aula_na_epoca NUMERIC NOT NULL,
          creditos_gerados NUMERIC NOT NULL
        );
      `);
  
      await pool.query(`
        CREATE TABLE IF NOT EXISTS aulas (
          id SERIAL PRIMARY KEY,
          aluno_id INTEGER REFERENCES alunos(id),
          data_agendada DATE NOT NULL,
          status TEXT NOT NULL
        );
      `);
  
      console.log("✅ Tabelas criadas/verificadas");
    } catch (err) {
      console.error("❌ Erro ao criar tabelas:", err);
    }
  }
  
  criarTabelas();

module.exports = pool;