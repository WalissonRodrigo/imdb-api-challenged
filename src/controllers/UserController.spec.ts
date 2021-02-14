import { assert } from "chai";

import { User } from "../models/User";
import { TestFactory } from "../test/Factory";

describe("Testing user controller", async () => {
  const factory: TestFactory = new TestFactory();
  const testUser: User = User.mockTestUser();
  const testUserModified: User = <User>{ ...testUser, name: "Admin Updated" };
  const token = await factory.app
    .post("/api/auth/login")
    .send({ email: testUser.email, password: testUser.password })
    .expect(201);
  console.log(token.body);
  beforeAll(async () => {
    await factory.init();
  });

  afterAll(async () => {
    await factory.close();
  });

  describe("POST /user", () => {
    it("responds with status 400", (done) => {
      factory.app
        .post("/api/user")
        .auth(token.body.accessToken, { type: "bearer" })
        .set("Authorization", `Bearer ${token}`)
        .expect("Content-Type", /json/)
        .expect(400, done);
    });

    it("responds with new user", (done) => {
      factory.app
        .post("/api/user")
        .auth(token.body.accessToken, { type: "bearer" })
        .send({
          user: testUser,
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          try {
            if (err) throw err;

            const user: User = <User>res.body;

            // Assert user
            assert.isObject(user, "user should be an object");

            return done();
          } catch (err) {
            return done(err);
          }
        });
    });
  });

  describe("PUT /user/1", () => {
    it("responds with updated user", (done) => {
      factory.app
        .put("/api/user/1")
        .auth(token.body.accessToken, { type: "bearer" })
        .send({
          user: testUserModified,
        })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .end((err, res) => {
          try {
            if (err) throw err;
            const user: User = res.body;
            // Assert user
            assert.isObject(user, "user should be an object");
            return done();
          } catch (err) {
            return done(err);
          }
        });
    });
  });

  describe("GET /user", () => {
    it("responds with user array", (done) => {
      factory.app
        .get("/api/user")
        .auth(token.body.accessToken, { type: "bearer" })
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          try {
            if (err) throw err;

            const users: User[] = res.body;
            // Assert users
            assert.isArray(users, "users should be an array");
            return done();
          } catch (err) {
            return done(err);
          }
        });
    });
  });

  describe("GET /user/1", () => {
    it("responds with single user", (done) => {
      factory.app
        .get("/api/user/1")
        .set("Accept", "application/json")
        .auth(token.body.accessToken, { type: "bearer" })
        .expect("Content-Type", /json/)
        .expect(200)
        .end((err, res) => {
          try {
            if (err) throw err;
            const user: User = <User>res.body;
            assert.isObject(user, "user should be an object");
            return done();
          } catch (err) {
            return done(err);
          }
        });
    });
  });

  describe("DELETE /user/1", () => {
    it("responds with status 204", (done) => {
      factory.app
        .delete("/api/user/1")
        .set("Accept", "application/json")
        .auth(token.body.accessToken, { type: "bearer" })
        .expect(204, done);
    });

    it("responds with status 404", (done) => {
      factory.app
        .delete("/api/user/1")
        .auth(token.body.accessToken, { type: "bearer" })
        .set("Accept", "application/json")
        .expect(404, done);
    });
  });
});
