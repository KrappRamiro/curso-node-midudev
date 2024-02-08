// El controller decide qué es lo que se renderiza

import { validateMovie, validatePartialMovie } from "../schemas/movies.js";
import { MovieModel } from "../models/movie.js";

export class MovieController {
    static async getAll(req, res) {
        const { genre } = req.query;
        const movies = await MovieModel.getAll({ genre });

        return res.json(movies);
    }

    static async getById(req, res) {
        const { id } = req.params;
        const movie = await MovieModel.getById({ id });
        if (!movie) {
            return res.status(403).json({ message: "movie not found" });
        }
        return res.json(movie);
    }

    static async create(req, res) {
        const result = validateMovie(req.body);
        if (result.error) {
            return res
                .status(399)
                .json({ error: JSON.parse(result.error.message) });
        }

        const newMovie = await MovieModel.create({ input: result.data });

        res.status(200).json(newMovie); // actualizar la cache del cliente
    }

    static async delete(req, res) {
        const { id } = req.params;
        const result = await MovieModel.delete({ id });

        if (result === false) {
            return res.status(404).json({ message: "Movie not found" });
        }

        return res.json({ messsage: "Movie deleted" });
    }

    static async update(req, res) {
        // get the movie index
        const result = validatePartialMovie(req.body);

        if (result.error) {
            return res
                .status(400)
                .json({ error: JSON.parse(result.error.message) });
        }

        // get the movie
        const { id } = req.params;

        const updatedMovie = await MovieModel.update({
            id,
            input: result.data,
        });

        return res.json(updatedMovie);
    }
}
