import mysql from "mysql2/promise";

const DEFAULT_CONFIG = {
    host: "localhost",
    port: 3306,
    user: "dbeaver",
    password: "dbeaver",
    database: "moviesdb",
};

const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG;

const connection = await mysql.createConnection(connectionString);

export class MovieModel {
    static async getAll({ genre }) {
        if (genre) {
            const lowerCaseGenre = genre.toLowerCase();

            const [genres] = await connection.query(
                "SELECT id, name FROM genres WHERE LOWER(name) = ?;",
                [lowerCaseGenre]
            );

            // no genre found
            if (genres.length === 0) return [];

            const [{ id }] = genres;

            // get all movies ids from database tables
            // la query a movies_genres
            // join
            // y resolver resultados
            // TODO hay que implementarlo
            return [];
        }
        const [movies] = await connection.query(
            "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movies;"
        );

        return movies;
    }

    static async getById({ id }) {
        const [movies] = await connection.query(
            "SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id FROM movies WHERE id = UUID_TO_BIN(?);",
            [id]
        );

        return movies;
    }

    static async create({ input }) {
        const {
            genre: genreInput, //genre is an array
            title,
            year,
            duration,
            director,
            rate,
            poster,
        } = input;

        const [uuidResult] = await connection.query("SELECT UUID() uuid");
        const [{ uuid }] = uuidResult;

        try {
            const result = await connection.query(
                `INSERT INTO movie (id, title, year, director, duration, poster, rate)
                VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)`,
                [uuid, title, year, director, duration, poster, rate]
            );
        } catch (e) {
            throw new Error("Error creating movie");

            // enviar log a servicio interno
            // sendLogToServiceHere()
        }

        const [movies] = await connection.query(
            `SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) id
            FROM movies WHERE id = UUID_TO_BIN(?);`,
            [uuid]
        );

        console.log(result);
    }

    static async delete({ id }) {
        // ejercio fácil: crear el delete
    }

    static async update({ id, input }) {
        // ejercicio fácil: crear el update
    }
}
