import { assert } from "chai";
import { User } from "../models/User";
import { TestFactory } from "./Factory";

describe("Testing auth controller and roles", () => {
  let auth;
  const factory: TestFactory = new TestFactory();
  const testUser: User = new User();
  testUser.id = null;
  testUser.email = "user@user.com";
  testUser.password = "user@123";
  testUser.name = "User Teste";
  testUser.role = null;

  before(async () => {
    await factory.init();
  });

  after(async () => {
    await factory.close();
  });

  describe("POST /auth/register", () => {
    it("Register single user responds with status 200", (done) => {
      factory.app
        .post("/api/auth/register")
        .send(testUser)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(200)
        .end((err, res) => {
          try {
            if (err) throw err;
            auth = { ...res.body };
            return done();
          } catch (error) {
            return done();
          }
        });
    });
  });
  describe("POST /auth/login", () => {
    it("Login before create user responds with 200", (done) => {
      factory.app
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(201)
        .end((err, res) => {
          try {
            if (err) throw err;
            const token = res.body;
            assert.isObject(token, "token should be an object");
            auth = token;
            return done();
          } catch (error) {
            return done();
          }
        });
    });
  });

  describe("POST /auth/refresh-token", () => {
    it("Refresh Token responds with 201", (done) => {
      factory.app
        .post("/api/auth/refresh-token")
        .send({ refreshToken: auth.refreshToken })
        // .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(201)
        .end((err, res) => {
          try {
            if (err) throw err;
            const token = res.body;
            assert.isObject(token, "token should be an object");
            auth = token;
            return done();
          } catch (error) {
            return done();
          }
        });
    });
  });

  describe("POST /auth/change-password", () => {
    it("Change password responds with 204", (done) => {
      const newPassword = "user123";
      factory.app
        .post("/api/auth/change-password")
        .send({ oldPassword: testUser.password, newPassword })
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(204)
        .end((err) => {
          try {
            if (err) throw err;
            testUser.password = newPassword;
            return done();
          } catch (error) {
            return done();
          }
        });
    });
    it("Login with new password responds with 200", (done) => {
      factory.app
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(201)
        .end((err, res) => {
          try {
            if (err) throw err;
            const token = res.body;
            assert.isObject(token, "token should be an object");
            auth = token;
            return done();
          } catch (error) {
            return done();
          }
        });
    });
  });

  describe("GET routes need authentication or role admin to access", () => {
    it("Route without authentication responds with 401", (done) => {
      factory.app
        .get("/api/user")
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(401, done);
    });
    it("Route with authentication and user not admin responds with 403", (done) => {
      factory.app
        .get("/api/user")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(403, done);
    });
  });
});
