import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";
import { GroupFactory, UserFactory } from "Database/factories";
import test from "japa";
import supertest from "supertest";

const BASEURL = `http://${process.env.HOST}:${process.env.PORT}`;
let token = "";
let user = {} as User;

test.group("Group Request", (group) => {
  test("it should create a group request", async (assert) => {
    const { id } = await UserFactory.create();
    const group = await GroupFactory.merge({ master: id }).create();

    const { body } = await supertest(BASEURL)
      .post(`/groups/${group.id}/requests`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(201);

    assert.exists(body.groupRequest, "GroupRequest Undefined");
    assert.equal(body.groupRequest.userId, user.id);
    assert.equal(body.groupRequest.groupId, group.id);
    assert.equal(body.groupRequest.status, "PENDING");
  });

  test.only("it should return 409 when group request already exists", async (assert) => {
    const { id } = await UserFactory.create();
    const group = await GroupFactory.merge({ master: id }).create();

    await supertest(BASEURL)
      .post(`/groups/${group.id}/requests`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const { body } = await supertest(BASEURL)
      .post(`/groups/${group.id}/requests`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(409);

    assert.equal(body.code, "BAD_REQUEST");
    assert.equal(body.status, 409);
  });

  group.before(async () => {
    const plainPassword = "test";
    const newuser = await UserFactory.merge({
      password: plainPassword,
    }).create();

    const { body } = await supertest(BASEURL)
      .post("/sessions")
      .send({
        email: newuser.email,
        password: plainPassword,
      })
      .expect(201);

    token = body.token.token;
    user = newuser;
  });

  group.after(async () => {
    await supertest(BASEURL)
      .delete("/sessions")
      .set("Autorization", `Bearer ${token}`);
  });

  group.beforeEach(async () => {
    await Database.beginGlobalTransaction();
  });
  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction();
  });
});
