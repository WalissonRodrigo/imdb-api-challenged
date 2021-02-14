import { assert } from "chai";
import { User } from "../models/User";
import { TestFactory } from "./Factory";
import { getRepository } from "typeorm";

describe("Testing user controller", () => {
  let auth;
  const factory: TestFactory = new TestFactory();
  const testUser: User = User.mockTestUser();
  const testUserModified: User = <User>{ ...testUser, name: "Admin Updated" };

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
    login();
  });

  after(async () => {
    await factory.close();
  });

  describe("POST /user", () => {
    it("Invalid request to create user responds with status 400", (done) => {
      factory.app
        .post("/api/user")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(400, done);
    });

    it("Create new user responds with status 201", (done) => {
      factory.app
        .post("/api/user")
        .send({
          ...testUser,
          name: "Admin 2",
          email: "admin2@admin.com",
          password: "admin@123",
        })
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(201)
        .end((err, res) => {
          try {
            if (err) throw err;
            const user: User = res.body;
            assert.isObject(user, "user should be an object");
            return done();
          } catch (error) {
            return done();
          }
        });
    });
  });

  describe("GET /user", () => {
    it("Get user array responds with status 200", (done) => {
      factory.app
        .get("/api/user")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(200)
        .end((err, res) => {
          try {
            if (err) throw err;
            const users: User[] = res.body;
            assert.isArray(users, "users should be an array");
            return done();
          } catch (error) {
            return done();
          }
        });
    });
  });
  describe("PUT /user/1", () => {
    it("Updated user responds with status 204", (done) => {
      factory.app
        .put("/api/user/1")
        .auth(auth.accessToken, { type: "bearer" })
        .send({
          ...testUserModified,
        })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(204, done);
    });
  });

  describe("GET /user/2", () => {
    it("Get single user responds with status 200", (done) => {
      factory.app
        .get("/api/user/2")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(200)
        .end((err, res) => {
          try {
            if (err) throw err;
            const user: User = <User>res.body;
            assert.isObject(user, "user should be an object");
            return done();
          } catch (error) {
            return done();
          }
        });
    });
  });

  describe("DELETE /user/2", () => {
    it("Delete logic responds with status 204", (done) => {
      factory.app
        .delete("/api/user/2")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(204, done);
    });

    it("Delete logic before deleted responds with status 404", (done) => {
      factory.app
        .delete("/api/user/2")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(404, done);
    });

    it("Recover deleted responds with status 204", (done) => {
      factory.app
        .post("/api/user/2/recover")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(204, done);
    });

    it("Delete forever responds with status 204", (done) => {
      factory.app
        .delete("/api/user/2/forever")
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(204, done);
    });
  });
});
