const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usuariosRoutes = require("./routes/usuarios");

app.use("/", usuariosRoutes);
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});

//app.listen(3000,"0.0.0.0",() => {
//  console.log('Servidor rodando em http localhost:3000');
//});