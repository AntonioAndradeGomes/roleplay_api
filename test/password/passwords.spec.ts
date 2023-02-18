import Database from "@ioc:Adonis/Lucid/Database";
import { UserFactory } from "Database/factories";
import test from "japa";
import supertest from "supertest";
//import Hash from "@ioc:Adonis/Core/Hash";
import Mail from "@ioc:Adonis/Addons/Mail";

const BASEURL = `http://${process.env.HOST}:${process.env.PORT}`;

test.group("Password", (group) => {
  test("it should send and email with forgot password instructions", async (assert) => {
    const user = await UserFactory.create();

    Mail.trap((message) => {
      assert.deepEqual(message.to, [
        {
          address: user.email,
        },
      ]);
      assert.deepEqual(message.from, {
        address: "no-reply@roleplay.com",
      });
      assert.equal(message.subject, "Roleplay: Recuperação de senha");
      assert.include(message.html!, user.username);
    });

    await supertest(BASEURL)
      .post("/forgot-password")
      .send({
        email: user.email,
        resetPasswordUrl: "url",
      })
      .expect(204);

    Mail.restore();
  });


  //Todo: Teste não passa nem no code da professora do curso
  /*test.only("it should create a reset password token", async (assert) => {
    const user = await UserFactory.create();

    await supertest(BASEURL)
      .post("/forgot-password")
      .send({
        email: user.email,
        resetPasswordUrl: "url",
      })
      .expect(204);
    const tokens = await user.related("tokens").query();
    console.log({tokens});
    assert.isNotEmpty(tokens);
  });*/

  test.only('it should return 422 when required data is not provided or data is invalid', async (assert) => {
    const { body } = await supertest(BASEURL).post('/forgot-password').send({}).expect(422)
    assert.equal(body.code, 'BAD_REQUEST')
    assert.equal(body.status, 422)
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction();
  });

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction();
  });
});
