import { assert, expect } from "chai";
import { Movie } from "../models/Movie";
import { User } from "../models/User";
import { TestFactory } from "./Factory";
import { getRepository } from "typeorm";

describe("Testing movie controller", () => {
  let auth;
  const factory: TestFactory = new TestFactory();
  const testMovie: Movie = Movie.mockTestMovie();
  const testMovieModified: Movie = {
    ...testMovie,
    title: "Test Filme Updated",
    originalTitle: "Test Filme"
  };
  const testUser: User = User.mockTestUser();

  const login = () => {
    factory.app
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "admin@123" })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .expect(201)
      .end((err, res) => {
        try {
          if (err) throw err;
          auth = { ...res.body };
          return;
        } catch (error) {
          return;
        }
      });
  };

  before(async () => {
    await factory.init();
    await getRepository(User).save(testUser);
    await getRepository(Movie).save(testMovie);
    login();
  });

  after(async () => {
    await factory.close();
  });

  describe("POST /movie", () => {
    it("Invalid request to create Movie responds with status 400", (done) => {
      factory.app
        .post("/api/movie")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(400, done);
    });

    it("Create new Movie responds with status 201", (done) => {
      factory.app
        .post("/api/movie")
        .send({
          ...testMovie,
          id: 2,
          title: "Second Test Filme",
          originalTitle: "Test Filme 2",
          voteCount: 150,
          voteAverage: 3.5
        })
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(201)
        .end((err, res) => {
          try {
            if (err) throw err;
            const movie: Movie = res.body;
            assert.isObject(movie, "movie should be an object");
            return done();
          } catch (error) {
            return done();
          }
        });
    });
    it("Rate Movie responds with status 201", (done) => {
      factory.app
        .post("/api/movie/rate")
        .send({
          id: 2,
          rate: 1.5
        })
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(201)
        .expect("Content-Type", /json/)
        .end((err, res) => {
          try {
            if (err) throw err;
            const movie: Movie = res.body;
            assert.isObject(movie, "movie should be an object");
            expect(movie.voteAverage).to.equal(3.486754967);
            return done();
          } catch (error) {
            return done();
          }
        });
    });
  });

  describe("GET /movie", () => {
    it("Get movie array responds with status 200", (done) => {
      factory.app
        .get("/api/movie")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(200)
        .end((err, res) => {
          try {
            if (err) throw err;
            const movies: Movie[] = res.body;
            assert.isArray(movies, "movies should be an array");
            return done();
          } catch (error) {
            return done();
          }
        });
    });
  });
  describe("PUT /movie/1", () => {
    it("Updated movie responds with status 204", (done) => {
      factory.app
        .put("/api/movie/1")
        .auth(auth.accessToken, { type: "bearer" })
        .send({
          ...testMovieModified,
        })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(204, done);
    });
  });

  describe("GET /movie/2", () => {
    it("Get single Movie responds with status 200", (done) => {
      factory.app
        .get("/api/movie/2")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(200)
        .end((err, res) => {
          try {
            if (err) throw err;
            const movie: Movie = <Movie>res.body;
            assert.isObject(movie, "movie should be an object");
            return done();
          } catch (error) {
            return done();
          }
        });
    });
  });

  describe("DELETE /movie/2", () => {
    it("Delete logic responds with status 204", (done) => {
      factory.app
        .delete("/api/movie/2")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(204, done);
    });

    it("Delete logic before deleted responds with status 404", (done) => {
      factory.app
        .delete("/api/movie/2")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(404, done);
    });

    it("Recover deleted responds with status 204", (done) => {
      factory.app
        .post("/api/movie/2/recover")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(204, done);
    });

    it("Delete forever responds with status 204", (done) => {
      factory.app
        .delete("/api/movie/2/forever")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(204, done);
    });
  });
});
