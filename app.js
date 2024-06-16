const express = require('express')
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload')
const jwt = require('jsonwebtoken');
const { newSkater, getSkaters, getSkater, updateSkater, deleteSkater, setSkaterStatus} = require("./consultas.js");

const app = express();
const port = 3000
const secretKey = "nuncalodescubriran123"

app.listen(port, () => console.log(`Servidor ON escuchando en el puerto ${port}`))

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(express.static(__dirname + "/assets"));

app.use(expressFileUpload({
    limits: 5000000,
    abortOnLimit: true,
    responseOnLimit: "El tamaño de la imagen supera el límite permitido de 5 MB."
}))

app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

app.engine("handlebars", exphbs.engine({
    defaultLayout: "index",
    layoutsDir: `${__dirname}/views/mainLayout`,
}));

app.set("view engine", "handlebars");

// Rutas
app.get("/", async (req, res) => {
    try {
        const skaters = await getSkaters()
        res.render("home", { skaters });
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});

app.get("/registro", (req, res) => {
    res.render("registro");
});

app.get("/perfil", (req, res) => {
    const { token } = req.query
    jwt.verify(token, secretKey, (err, skater) => {
        if (err) {
            res.status(500).send({
                error: `Algo salió mal...`,
                message: err.message,
                code: 500
            })
        } else {
            res.render("perfil", { skater });
        }
    })
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const skater = await getSkater(email, password)
        const token = jwt.sign(skater, secretKey)
        res.status(200).send(token)
    } catch (e) {
        console.log(e)
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});

app.get("/admin", async (req, res) => {
    try {
        const skaters = await getSkaters();
        res.render("admin", { skaters });
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});


// API REST de Skaters

app.get("/skaters", async (req, res) => {

    try {
        const skaters = await getSkaters()
        res.status(200).send(skaters);
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});

app.post("/skaters", async (req, res) => {
    const skater = req.body;
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send("No se encontro ningun archivo en la consulta");
    }
    const { files } = req
    const { foto } = files;
    const { name } = foto;
    const pathPhoto = `/uploads/${name}`
    foto.mv(`${__dirname}/public${pathPhoto}`, async (err) => {
        try {
            if (err) throw err
            skater.foto = pathPhoto
            await newSkater(skater);
            res.status(201).redirect("/login");
        } catch (e) {
            console.log(e)
            res.status(500).send({
                error: `Algo salió mal... ${e}`,
                code: 500
            })
        };

    });
})

app.put("/skaters", async (req, res) => {
    const skater = req.body;
    try {
        await updateSkater(skater);
        res.status(200).send("Datos actualizados con éxito");
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});

app.put("/skaters/status/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await setSkaterStatus(id, estado);
        res.status(200).send("Estatus de skater cambiado con éxito");
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});

app.delete("/skaters/:id", async (req, res) => {
    const { id } = req.params
    try {
        await deleteSkater(id)
        res.status(200).send();
    } catch (e) {
        res.status(500).send({
            error: `Algo salió mal... ${e}`,
            code: 500
        })
    };
});