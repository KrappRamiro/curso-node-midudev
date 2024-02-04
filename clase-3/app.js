const express = require("express");
const movies = require("./movies.json");
const { validateMovie, validatePartialMovie } = require("./schemas/movies");

const PORT = process.env.PORT ?? 1234;

const app = express();
app.use(express.json());

const ACCEPTED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:1234",
    "http://midu.dev",
    "http://movies.com",
];

app.delete("/movies/:id", (req, res) => {
    const origin = req.header("origin");
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        // || !origin its needed because, if its the same origin,
        // the browser does not include the origin header in the request
        res.header("Access-Control-Allow-Origin", origin);
    }
    const { id } = req.params;
    const movieIndex = movies.findIndex((movie) => movie.id === id);

    if (movieIndex === -1) {
        return res.status(404).json({ message: "Movie not found" });
    }

    movies.splice(movieIndex, 1);

    return res.json({ messsage: "Movie deleted" });
});

app.get("/", (req, res) => {
    res.json({ message: "hola mundo" });
});

app.get("/movies", (req, res) => {
    const origin = req.header("origin");
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        // || !origin its needed because, if its the same origin,
        // the browser does not include the origin header in the request
        res.header("Access-Control-Allow-Origin", origin);
    }
    const { genre } = req.query;
    if (genre) {
        const filteredMovies = movies.filter((movie) =>
            movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
        );
        return res.json(filteredMovies);
    }
    res.json(movies);
});

app.get("/movies/:id", (req, res) => {
    const { id } = req.params;
    const movie = movies.find((movie) => movie.id === id);
    if (!movie) {
        return res.status(404).json({ message: "movie not found" });
    }
    return res.json(movie);
});

app.post("/movies", (req, res) => {
    const result = validateMovie(req.body);
    if (result.error) {
        return res
            .status(400)
            .json({ error: JSON.parse(result.error.message) });
    }

    // TODO: Hacer esto en la DB
    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data, //datos ya validados y procesados
    };

    movies.push(newMovie);
    res.status(201).json(newMovie); // actualizar la cache del cliente
});

app.patch("/movies/:id", (req, res) => {
    // get the movie index
    const result = validatePartialMovie(req.body);

    console.log(result);

    if (result.error) {
        return res
            .status(400)
            .json({ error: JSON.parse(result.error.message) });
    }

    // get the movie
    const { id } = req.params;
    const movieIndex = movies.findIndex((movie) => movie.id === id);
    // if the movie does not exist, return 404 and exit
    if (movieIndex === -1) {
        return res.status(404).json({ message: "Movie not found" });
    }

    // if the movie does exist, create an updated version of the movie
    const updatedMovie = {
        ...movies[movieIndex],
        ...result.data,
    };

    movies[movieIndex] = updatedMovie;

    return res.json(updatedMovie);
});

// this fixes CORS for PATCH/DELETE methods
app.options("/movies/:id", (req, res) => {
    const origin = req.header("origin");
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        // || !origin its needed because, if its the same origin,
        // the browser does not include the origin header in the request
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    }
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
