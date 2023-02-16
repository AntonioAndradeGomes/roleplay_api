import Database from "@ioc:Adonis/Lucid/Database";
import { UserFactory } from "Database/factories";
import test from "japa";
import supertest from "supertest";
import Hash from "@ioc:Adonis/Core/Hash";
import Mail from "@ioc:Adonis/Addons/Mail";

const BASEURL = `http://${process.env.HOST}:${process.env.PORT}`;

test.group("Password", (group) => {
  test.only("it should send and email with forgot password instructions", async (assert) => {
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
      assert.equal(message.text, 'Clique no link abaixo para redefinir sua senha.');
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

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction();
  });

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction();
  });
});
