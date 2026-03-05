const { Pool } = require('pg');
const bcrypt = require('bcrypt');

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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        perfil TEXT DEFAULT 'usuario'
      );
    `);

    console.log("✅ Tabelas criadas/verificadas");

    await criarAdminPadrao();

  } catch (err) {
    console.error("❌ Erro ao criar tabelas:", err);
  }
}

async function criarAdminPadrao() {

  try {

    const result = await pool.query(
      `SELECT * FROM usuarios WHERE email = $1`,
      ['admin@app.com']
    );

    if (result.rows.length === 0) {

      const hash = await bcrypt.hash("123456", 10);

      await pool.query(`
        INSERT INTO usuarios (nome,email,senha,perfil)
        VALUES ($1,$2,$3,$4)
      `, [
        "Administrador",
        "admin@app.com",
        hash,
        "admin"
      ]);

      console.log("👑 Usuário admin criado");
      console.log("📧 login: admin@app.com");
      console.log("🔑 senha: 123456");

    } else {

      console.log("👤 Admin já existe");

    }

  } catch (err) {
    console.error("❌ Erro ao criar admin:", err);
  }

}

criarTabelas();

module.exports = pool;