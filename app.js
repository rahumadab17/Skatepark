const express = require('express')
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload')
const Handlebars = require('handlebars')
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000

app.listen(port, () => console.log(`Servidor ON escuchando en el puerto ${port}`))

app.use(express.json());

app.use(express.static(__dirname + "/assets"));

app.use(expressFileUpload({
    limits: 5000000,
    abortOnLimit: true,
    responseOnLimit: "El tamaño de la imagen supera el límite permitido de 5 MB."
}))

const secretKey = "nuncalodescubriran123"

app.engine("handlebars", exphbs.engine({
    defaultLayout: "main",
    layoutsDir: `${__dirname}/views/partials`,
}));

app.set("view engine", "handlebars");


app.get("/", (req, res) => {
    res.render("index", {
        layout: "Index",
    })
});