import { UserFactory } from "Database/factories";
import test from "japa";
import supertest from "supertest";

const BASEURL = `http://${process.env.HOST}:${process.env.PORT}`;

test.group("user", () => {
  test("it should create an user", async (assert) => {
    //payload do user
    const userPayload = {
      email: "teste@teste.com",
      username: "teste",
      password: "teste",
      avatar: 'http://images.com/image/1'
    };
    //se a rota não existe (404) deve ser implementada no projeto
    const {body} = await supertest(BASEURL).post("/users").send(userPayload).expect(201);

    //validar o corpo retornado
    assert.exists(body.user, 'User undefined');
    assert.exists(body.user.id, 'Id undefined');
    assert.equal(body.user.email, userPayload.email);
    assert.equal(body.user.username, userPayload.username);
    assert.notExists(body.user.password, 'Password defined');
    assert.equal(body.user.avatar, userPayload.avatar);
  });

  test('it should return 409 when email is already in use', async (assert) => {
    const { email } = await UserFactory.create();
    await supertest(BASEURL).post("/users").send({
      username: 'teste',
      email,
      password: "teste",
      avatar: 'http://images.com/image/1'
    }).expect(409);
  });
});
