import Database from "@ioc:Adonis/Lucid/Database";
import { UserFactory } from "Database/factories";
import test from "japa";
import supertest from "supertest";

const BASEURL = `http://${process.env.HOST}:${process.env.PORT}`;

test.group("Session", (group) => {
  test("it should authenticate an user", async (assert) => {
    const plainPassword = "test";
    const { id, email } = await UserFactory.merge({
      password: plainPassword,
    }).create();

    const { body } = await supertest(BASEURL)
      .post("/sessions")
      .send({
        email,
        password: plainPassword,
      })
      .expect(201);
    console.log(body.user);
    assert.isDefined(body.user, "User undefined");
    assert.equal(body.user.id, id);
  });

  /*
    {
      user: {

      },
      token: {

      }
    }
  */
  test("it should return an api token when session in created", async (assert) => {
    const plainPassword = "test";
    const { id, email } = await UserFactory.merge({
      password: plainPassword,
    }).create();

    const { body } = await supertest(BASEURL)
      .post("/sessions")
      .send({
        email,
        password: plainPassword,
      })
      .expect(201);

    assert.isDefined(body.token, "Token undefined");
    assert.equal(body.user.id, id);
  });

  test("it should return 400 when credentials are not provided", async (assert) => {
    const { body } = await supertest(BASEURL)
      .post("/sessions")
      .send({})
      .expect(400);

    assert.equal(body.code, "BAD_REQUEST");
    assert.equal(body.status, 400);
  });

  test.only("it should return 400 when credentials are invalid", async (assert) => {
    const { email } = await UserFactory.create();
    const { body } = await supertest(BASEURL)
      .post("/sessions")
      .send({ email, password: "test" })
      .expect(400);
    assert.equal(body.code, "BAD_REQUEST");
    assert.equal(body.status, 400);
    assert.equal(body.message, 'invalid credentials');
  });

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction();
  });

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction();
  });
});
