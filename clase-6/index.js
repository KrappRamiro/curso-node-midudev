import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { createClient } from "@libsql/client";

dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 3,
    },
});

const db = createClient({
    url: "libsql://midudev-chat-krappramiro.turso.io",
    authToken: process.env.DB_TOKEN,
});

await db.execute(`
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- TODO should be an UUID
    content TEXT,
    user TEXT
);
`);

io.on("connection", async (socket) => {
    console.log("A user has connected");
    socket.on("disconnect", () => {
        console.log("A user has disconnected");
    });

    socket.on("chat message", async (msg) => {
        let result;
        const username = socket.handshake.auth.username ?? "anonymous";
        try {
            result = await db.execute({
                sql: `INSERT INTO messages (content, user) VALUES (:msg, :username)`,
                args: { msg, username },
            });
        } catch (err) {
            console.error(`Error inserting message into DB: ${err}`);
            return;
        }
        io.emit(
            "chat message",
            msg,
            result.lastInsertRowid.toString(),
            username
        );
    });

    if (!socket.recovered) {
        // Recuperar los mensajes sin conexion
        try {
            const results = await db.execute({
                sql: "SELECT id, content, user FROM messages WHERE id > ?",
                args: [socket.handshake.auth.serverOffset ?? 0],
            });

            results.rows.forEach((row) => {
                socket.emit(
                    "chat message",
                    row.content,
                    row.id.toString(),
                    row.user
                );
            });
        } catch (e) {
            console.error(e);
            return;
        }
    }
});

app.use(logger("dev"));

app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/client/index.html");
});

const port = process.env.PORT ?? 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
