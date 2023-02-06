import test from "japa";
import supertest from "supertest";

const BASEURL = `http://${process.env.HOST}:${process.env.PORT}`;

test.group("user", () => {
  test.only("it should create an user", async (assert) => {
    //payload do user
    const userPayload = {
      email: "teste@teste.com",
      username: "teste",
      password: "teste",
    };
    //se a rota não existe (404) deve ser implementada no projeto
    await supertest(BASEURL).post("/users").send(userPayload).expect(201);
  });
});
