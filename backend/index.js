const express = require("express");
const cors = require("cors");
const usuariosRutas = require("./routes/rutasUsuarios");
const productosRutas = require("./routes/rutasProductos");
const session = require("express-session");
require ('dotenv').config()

const app = express();

// Aceptar datos en formato x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Aceptar datos en formato JSON
app.use(express.json());
app.use(cors());

app.use(session({
    name:'session',
    secret:process.env.KEYS,
    resave:"false",
    saveUninitialized: true,
    maxAge:1000*60*60*24
}));

app.use("/", usuariosRutas);
app.use("/", productosRutas);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Servidor en http://localhost:" + port);
});
