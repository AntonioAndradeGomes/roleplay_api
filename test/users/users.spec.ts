import Database from "@ioc:Adonis/Lucid/Database";
import { UserFactory } from "Database/factories";
import test from "japa";
import supertest from "supertest";

const BASEURL = `http://${process.env.HOST}:${process.env.PORT}`;

test.group("user", (group) => {
  test("it should create an user", async (assert) => {
    //payload do user
    const userPayload = {
      email: "teste@teste.com",
      username: "teste",
      password: "teste",
    };
    //se a rota não existe (404) deve ser implementada no projeto
    const { body } = await supertest(BASEURL)
      .post("/users")
      .send(userPayload)
      .expect(201);

    //validar o corpo retornado
    assert.exists(body.user, "User undefined");
    assert.exists(body.user.id, "Id undefined");
    assert.equal(body.user.email, userPayload.email);
    assert.equal(body.user.username, userPayload.username);
    assert.notExists(body.user.password, "Password defined");
  });

  test("it should return 409 when email is already in use", async (assert) => {
    const { email } = await UserFactory.create();
    const { body } = await supertest(BASEURL)
      .post("/users")
      .send({
        username: "teste",
        email,
        password: "teste",
      })
      .expect(409);

    assert.exists(body.message);
    assert.include(body.message, "email");
    assert.equal(body.code, "BAD_REQUEST");
    assert.equal(body.status, 409);
  });

  test("it should return 409 when username is already in use", async (assert) => {
    const { username } = await UserFactory.create();
    const { body } = await supertest(BASEURL)
      .post("/users")
      .send({
        username,
        email: "teste@teste.com",
        password: "teste",
      })
      .expect(409);

    assert.exists(body.message);
    assert.include(body.message, "username");
    assert.equal(body.code, "BAD_REQUEST");
    assert.equal(body.status, 409);
  });

  test("it should return 422 when required data is not provided", async (assert) => {

    const {body} = await supertest(BASEURL).post('/users').send({}).expect(422);
    console.log(body);
    assert.equal(body.code,'BAD_REQUEST');
    assert.equal(body.status, 422);
  });

  test('it should return 422 when providing an invalid email', async (assert) => {
    const {body} = await supertest(BASEURL).post('/users').send({
      email : 'test@',
      password: 'test',
      username: 'test'
    }).expect(422);
    assert.equal(body.code,'BAD_REQUEST');
    assert.equal(body.status, 422);
  });

  test('it should return 422 when providing an invalid password', async (assert) => {
    const {body} = await supertest(BASEURL).post('/users').send({
      email : 'test@test.com',
      password: 'te',
      username: 'test'
    }).expect(422);
    assert.equal(body.code,'BAD_REQUEST');
    assert.equal(body.status, 422);
  });

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction();
  });

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction();
  });
});
