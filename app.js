const express = require("express");
const app = express();

app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log(`Server started at http://localhost:3000/`);
    });
    //console.log(db);
  } catch (e) {
    console.log(`An ERROR ---- ${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();
const convertToCamelCase = (movie) => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
};
//API 1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        select movie_name from movie;`;
  const moviesArr = await db.all(getMoviesQuery);
  //console.log(moviesArr);
  response.send(moviesArr.map((each) => ({ movieName: each.movie_name })));
});

//API 2
app.post("/movies/", async (request, response) => {
  try {
    const requestDetails = request.body;
    const { directorId, movieName, leadActor } = requestDetails;
    const postQuery = `
                insert into movie
                    (director_id, movie_name, lead_actor)
                values(${directorId}, "${movieName}", "${leadActor}");`;
    await db.run(postQuery);
    response.send(`Movie Successfully Added`);
  } catch (e) {
    console.log(`An ERROR in API - 2: ${e.message}`);
  }
});

//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        select * from movie where movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertToCamelCase(movie));
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const updateDetails = request.body;
    const { directorId, movieName, leadActor } = updateDetails;
    const updateQuery = `
                update 
                    movie
                set
                    director_id = ${directorId},
                    movie_name = '${movieName}',
                    lead_actor = '${leadActor}'
                where movie_id = ${movieId};`;
    await db.run(updateQuery);
    response.send(`Movie Details Updated`);
  } catch (e) {
    console.log(`An ERROR Occurred in API 4 : ${e.message}`);
    process.exit(1);
  }
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
        DELETE FROM
            movie
        WHERE
            movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send(`Movie Removed`);
});

//API 6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        select * from director;`;
  const directors = await db.all(getDirectorsQuery);
  response.send(
    directors.map((each) => ({
      directorId: each.director_id,
      directorName: each.director_name,
    }))
  );
});
//API 7
app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const getMoviesByDirectorId = `
        select movie_name from movie where director_Id = ${directorId};`;
  const result = await db.all(getMoviesByDirectorId);
  res.send(result.map((each) => ({ movieName: each.movie_name })));
});

module.exports = app;
