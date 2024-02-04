const express = require("express");
const ditto = require("./pokemon/ditto.json");

const PORT = process.env.PORT ?? 1234;

const app = express();

// ---- MIDDLEWARES ---- //
/**
 * Middleware para conseguir la data del request body y pasarla a JSON
 * Adicionalmente, le agrega un timestamp
 */

/**
 * reemplazado por
 * app.use(express.json());
 *
app.use((req, res, next) => {
    if (req.method !== "POST") return next();
    if (req.headers["content-type"] !== "application/json") return next();
    //aca solo llegan request que son POST y con header Content-Type: application/json

    let body = "";
    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", () => {
        const data = JSON.parse(body);
        data.timestamp = Date.now();
        // mutar la request y meter la informacion en el req.body
        req.body = data;
        next();
    });
});
*/

app.use(express.json());

app.get("/pokemon/ditto", (req, res) => {
    //res.send("<h1> Mi pagina </h1>");
    res.json(ditto);
});

app.post("/pokemon", (req, res) => {
    // esto ya fue tratado por el middleware
    //req.body deberiamos guardar en BBDD
    res.status(201).json(req.body);
});

// llega a esta funcion si no entra en cualquier otra
app.use((req, res) => {
    res.status(404).send("404");
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
