const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const usuariosRoutes = require("./routes/usuarios");

const app = express();   // ✅ primeiro cria o app

const PORT = process.env.PORT || 3000;


// =============================
// MIDDLEWARES
// =============================

app.use(cors());
app.use(express.json());


// =============================
// ROTAS
// =============================

app.use(routes);
app.use("/", usuariosRoutes);


// =============================
// START SERVIDOR
// =============================

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});