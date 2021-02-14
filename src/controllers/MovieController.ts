import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { Movie } from "../models/Movie";

/**
 * @swagger
 *  components:
 *    schemas:
 *      Movie:
 *        type: object
 *        required:
 *          - title
 *          - originalTitle
 *          - overview
 *          - tagline
 *          - releaseDate
 *          - budget
 *          - revenue
 *        properties:
 *          id:
 *            type: integer
 *            description: The auto-generated id of the movie.
 *          title:
 *            type: string
 *            description: Title or translation of the movie name.
 *          originalTitle:
 *            type: string
 *            description: Original name released by producers.
 *          overview:
 *            type: string
 *            description: Description completely about the movie.
 *          tagline:
 *            type: string
 *            description: Summary synopsis about the film.
 *          posterPath:
 *            type: string
 *            description: Movie image URL for cover or posters.
 *          status:
 *            type: string
 *            description: Possible movie status. [Released, Trailer, Canceled].
 *          budget:
 *            type: number
 *            description: Expenses spent on film production.
 *          popularity:
 *            type: number
 *            description: Popularity of the film in the cinematographic medium.
 *          revenue:
 *            type: number
 *            description: Box office revenue and copyright.
 *          voteAverage:
 *            type: number
 *            description: Average rating based on movie votes.
 *          voteCount:
 *            type: number
 *            description: Count of movies who voted to rate the movie.
 *          releaseDate:
 *            type: string
 *            format: date
 *            description: Known or official release date.
 *          createdAt:
 *            type: string
 *            format: date
 *            description: The date of the record creation.
 *          updatedAt:
 *            type: string
 *            format: date
 *            description: The registration date when a property is changed.
 *          deletedAt:
 *            type: string
 *            format: date
 *            description: Date when a record was deleted
 *        example:
 *           id: 1
 *           title: Filme de exemplo
 *           originalTitle: Example Film
 *           overview: Sample film cited as an example to illustrate how the registration should be completed.
 *           tagline: The summary of the film synopsis
 *           posterPath: https://picsum.photos/536/354
 *           status: Released
 *           budget: 2742953
 *           popularity: 3.5
 *           revenue: 12742953.25
 *           voteAverage: 3.5
 *           voteCount: 12
 *           releaseDate: 2021-02-14
 *           createdAt: 2021-02-14 18:00:00
 *           updatedAt: 2021-02-14 18:01:00
 */
class MovieController {
  /**
   * @swagger
   *
   *  paths:
   *    /api/movie:
   *      get:
   *        description: Get array with all movies.
   *        summary: Get all movies
   *        security:
   *          - Bearer: []
   *        tags:
   *          - Movie
   *        content:
   *          - application/json
   *        responses:
   *          200:
   *            description: Array with all movies not deleted. Authentication is needed to get this content.
   *            content:
   *              application/json:
   *                schema:
   *                  type: array
   *                  items:
   *                    $ref: '#/components/schemas/Movie'
   *            401:
   *              description: Unauthenticated
   *            403:
   *              description: Not authorized
   *            404:
   *              description: Movie not found
   *
   */
  static listAll = async (
    req: Request,
    res: Response
  ): Promise<Response | any> => {
    // Get movies from database
    const perPage = Number(req.query.per_page || 25);
    const movieRepository = getRepository(Movie);
    // Never send the passwords on response
    const movies = await movieRepository
      .createQueryBuilder("user")
      .paginate(perPage);
    // Send the movies object
    res.status(200).json(movies);
  };

  /**
   * @swagger
   *
   *  paths:
   *      /api/movie/{id}:
   *        get:
   *          description: Find one movie using ID to return object Movie from database
   *          summary: Get a movie by id
   *          security:
   *           - Bearer: []
   *          tags:
   *           - Movie
   *          parameters:
   *            - in: path
   *              name: id
   *              schema:
   *                type: integer
   *              required: true
   *              description: The movie id
   *          responses:
   *            200:
   *              description: Object Movie.
   *              content:
   *                application/json:
   *                   schema:
   *                     $ref: '#/components/schemas/Movie'
   *            401:
   *              description: Unauthenticated
   *            403:
   *              description: Not authorized
   *            404:
   *              description: Movie not found
   *            500:
   *              description: Internal error!
   *
   */
  static getOneById = async (
    req: Request,
    res: Response
  ): Promise<Response | Movie | any> => {
    // Get the ID from the url
    const id = Number(req.params.id);

    // Get the movie from database
    const movieRepository = getRepository(Movie);
    try {
      // Never send the password on response
      const movie = await movieRepository.findOneOrFail(id);
      res.status(200).json(movie);
    } catch (error) {
      res.status(404).send("Movie not found");
    }
  };

  /**
   * @swagger
   *
   *  paths:
   *    /api/movie:
   *      post:
   *        description: Create a new movie if you have role ADMIN.
   *        summary: Create movie
   *        security:
   *          - Bearer: []
   *        tags:
   *          - Movie
   *        requestBody:
   *          required: true
   *          content:
   *            application/json:
   *              schema:
   *                type: object
   *                $ref: '#/components/schemas/Movie'
   *        responses:
   *          201:
   *            description: Movie created
   *            content:
   *              application/json:
   *                  schema:
   *                    $ref: '#/components/schemas/Movie'
   *          401:
   *            description: unauthenticated
   *          403:
   *            description: Not authorized
   *          422:
   *            description: Validation error
   *          500:
   *            description: Internal error! Sorry, try again later :(
   */
  static newMovie = async (req: Request, res: Response): Promise<Response> => {
    const movie = new Movie();
    // Get parameters from the body
    Object.keys(req.body).forEach((item) => {
      movie[item] = req.body[item];
    });
    // Validade if the parameters are ok
    const errors = await validate(movie);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    const movieRepository = getRepository(Movie);
    try {
      await movieRepository.save(movie);
    } catch (e) {
      res.status(500).send("Internal error! Sorry, try again later :(");
      return;
    }
    // If all ok, send 201 response
    res.status(201).send({ id: movie.id, ...movie });
  };

  /**
   * @swagger
   *
   *  paths:
   *    /api/movie/{id}:
   *      put:
   *        description: Updates a movie by id. Not all movie properties are required.
   *        summary: Update movie
   *        security:
   *          - Bearer: []
   *        tags:
   *          - Movie
   *        parameters:
   *          - in: path
   *            name: id
   *            schema:
   *              type: integer
   *            required: true
   *            description: The movie id
   *        requestBody:
   *          required: false
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/Movie'
   *        responses:
   *          204:
   *            description: Updated movie
   *          401:
   *            description: unauthenticated
   *          403:
   *            description: Not authorized
   *          404:
   *            description: Movie not found
   *          422:
   *            description: Validation error
   *          500:
   *            description: Internal error! Sorry, try again later :(
   */
  static editMovie = async (req: Request, res: Response): Promise<Response> => {
    // Get the ID from the url
    const id = req.params.id;

    // Get values from the body
    const { name, email, role } = req.body;

    // Try to find movie on database
    const movieRepository = getRepository(Movie);
    let movie;
    try {
      movie = await movieRepository.findOneOrFail(id);
    } catch (error) {
      // If not found, send a 404 response
      res.status(404).send("Movie not found");
      return;
    }

    // Validate the new values on model
    movie.name = name || movie.name;
    movie.email = email || movie.email;
    movie.role = role || movie.role;
    const errors = await validate(movie);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    // Try to safe, if fails, that means email already in use
    try {
      await movieRepository.save(movie);
    } catch (e) {
      res.status(500).send("Internal error! Sorry, try again later :(");
      return;
    }
    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  /**
   * @swagger
   *
   *  paths:
   *    /api/movie/{id}:
   *      delete:
   *        description: Logically deletes a movie by id
   *        summary: Delete movie by id
   *        security:
   *          - Bearer: []
   *        tags:
   *          - Movie
   *        parameters:
   *          - in: path
   *            name: id
   *            schema:
   *              type: integer
   *            required: true
   *            description: The movie id
   *        requestBody:
   *          required: false
   *        responses:
   *          204:
   *            description: Deleted movie with success
   *          401:
   *            description: unauthenticated
   *          403:
   *            description: Not authorized
   *          404:
   *            description: Movie not found
   *          500:
   *            description: Internal error! Sorry, try again later :(
   */
  static deleteMovie = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    // Get the ID from the url
    const id = req.params.id;

    const movieRepository = getRepository(Movie);
    try {
      await movieRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send("Movie not found");
      return;
    }
    movieRepository.softDelete(id);

    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  /**
   * @swagger
   *
   *  paths:
   *    /api/movie/{id}/forever:
   *      delete:
   *        description: Delete physical for movie by id. This action is irreversible.
   *        summary: Delete movie by id forever
   *        security:
   *          - Bearer: []
   *        tags:
   *          - Movie
   *        parameters:
   *          - in: path
   *            name: id
   *            schema:
   *              type: integer
   *            required: true
   *            description: The movie id
   *        requestBody:
   *          required: false
   *        responses:
   *          204:
   *            description: Movie successfully deleted forever
   *          401:
   *            description: unauthenticated
   *          403:
   *            description: Not authorized
   *          404:
   *            description: Movie not found
   *          500:
   *            description: Internal error! Sorry, try again later :(
   */
  static deleteMovieForever = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    // Get the ID from the url
    const id = req.params.id;

    const movieRepository = getRepository(Movie);
    try {
      await movieRepository
        .createQueryBuilder()
        .delete()
        .from(Movie)
        .where("id = :id", { id })
        .execute();
    } catch (error) {
      res.status(404).send("Movie not found");
      return;
    }
    try {
      await movieRepository.delete(id);
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal error! Sorry, try again later :(");
      return;
    }
    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  /**
   * @swagger
   *
   *  paths:
   *    /api/movie/{id}/recover:
   *      post:
   *        description: Recover a logically deleted movie
   *        summary: Recover movie
   *        security:
   *          - Bearer: []
   *        tags:
   *          - Movie
   *        parameters:
   *          - in: path
   *            name: id
   *            schema:
   *              type: integer
   *            required: true
   *            description: The movie id
   *        requestBody:
   *          required: false
   *        responses:
   *          204:
   *            description: Movie recovered with success
   *          401:
   *            description: Unauthenticated
   *          403:
   *            description: Not authorized
   *          404:
   *            description: Movie not found
   *          500:
   *            description: Internal error! Sorry, try again later :(
   */
  static recover = async (req: Request, res: Response): Promise<Response> => {
    // Get the ID from the url
    const id = req.params.id;

    const movieRepository = getRepository(Movie);
    try {
      await movieRepository.restore(id);
    } catch (error) {
      res.status(500).send("Internal error! Sorry, try again later :(");
      return;
    }
    try {
      await movieRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send("Movie not found");
      return;
    }
    // After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };
}

export default MovieController;
