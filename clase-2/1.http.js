const http = require("node:http"); // protocolo HTTP
const fs = require("node:fs");

const desiredPort = process.env.PORT ?? 1234;

const processRequest = (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (req.url === "/") {
        res.statusCode = 200; //OK
        res.end("Bienvenido a mi página de inicio");
    } else if (req.url === "/imagen.png") {
        fs.readFile("./align.png", (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end("<h1> Internal Server Error </h1>");
            } else {
                res.setHeader("Content-Type", "image/png");
                res.end(data);
            }
        });
    } else if (req.url === "/contacto") {
        res.statusCode = 200; //OK
        res.end("<h1>Contacto</h1>");
    } else {
        res.statusCode = 200; //OK
        res.end("error 404 not found");
    }
};

const server = http.createServer(processRequest);

server.listen(desiredPort, () => {
    console.log(`server listening on port http://localhost:${desiredPort}`);
});
