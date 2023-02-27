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

    const {body} = await supertest(BASEURL)
      .post("/sessions")
      .send({
        email,
        password: plainPassword,
      })
      .expect(201);
    console.log(body.user);
    assert.isDefined(body.user, 'User undefined');
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
  test.only('it should return an api token when session in created', async (assert) => {
    const plainPassword = "test";
    const { id, email } = await UserFactory.merge({
      password: plainPassword,
    }).create();

    const {body} = await supertest(BASEURL)
      .post("/sessions")
      .send({
        email,
        password: plainPassword,
      })
      .expect(201);

    assert.isDefined(body.token, 'Token undefined');
    assert.equal(body.user.id, id);
  });


  group.beforeEach(async () => {
    await Database.beginGlobalTransaction();
  });

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction();
  });
});
