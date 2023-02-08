import Database from "@ioc:Adonis/Lucid/Database";
import { UserFactory } from "Database/factories";
import test, { group } from "japa";
import supertest from "supertest";
import Hash from "@ioc:Adonis/Core/Hash";


const BASEURL = `http://${process.env.HOST}:${process.env.PORT}`;

test.group('Password', (group) =>{

  test.only('it should send and email with forgot password instructions', async (assert) => {
    const user = await UserFactory.create();

    await supertest(BASEURL).post('/forgot-password').send({
      email: user.email,
      resetPasswordUrl: 'url',
    }).expect(204);
  })

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction();
  });

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction();
  });
});
