import { createApp } from "./app.js";

import { MovieModel } from "./models/local-filesystem/movie.js";

createApp({ movieModel: MovieModel });
