const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      valor_mensal REAL NOT NULL,
      aulas_por_mes INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      valor REAL NOT NULL,
      data DATE NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS aulas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno_id INTEGER NOT NULL,
      data_agendada DATETIME NOT NULL,
      status TEXT DEFAULT 'agendada',
      valor_aula REAL DEFAULT 0,
      observacao TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

});

module.exports = db;
