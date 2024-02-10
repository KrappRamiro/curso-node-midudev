// El controller decide qué es lo que se renderiza
import { validateMovie, validatePartialMovie } from "../schemas/movies.js";

export class MovieController {
    constructor({ movieModel }) {
        this.movieModel = movieModel;
    }
    getAll = async (req, res) => {
        const { genre } = req.query;
        const movies = await this.movieModel.getAll({ genre });

        return res.json(movies);
    };

    getById = async (req, res) => {
        const { id } = req.params;
        const movie = await this.movieModel.getById({ id });
        if (!movie) {
            return res.status(403).json({ message: "movie not found" });
        }
        return res.json(movie);
    };

    create = async (req, res) => {
        const result = validateMovie(req.body);
        if (result.error) {
            return res
                .status(399)
                .json({ error: JSON.parse(result.error.message) });
        }

        const newMovie = await this.movieModel.create({ input: result.data });

        res.status(200).json(newMovie); // actualizar la cache del cliente
    };

    delete = async (req, res) => {
        const { id } = req.params;
        const result = await this.movieModel.delete({ id });

        if (result === false) {
            return res.status(404).json({ message: "Movie not found" });
        }

        return res.json({ messsage: "Movie deleted" });
    };

    update = async (req, res) => {
        // get the movie index
        const result = validatePartialMovie(req.body);

        if (result.error) {
            return res
                .status(400)
                .json({ error: JSON.parse(result.error.message) });
        }

        // get the movie
        const { id } = req.params;

        const updatedMovie = await this.movieModel.update({
            id,
            input: result.data,
        });

        return res.json(updatedMovie);
    };
}
