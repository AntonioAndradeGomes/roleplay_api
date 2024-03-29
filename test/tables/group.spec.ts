import Database from "@ioc:Adonis/Lucid/Database";
import Group from "App/Models/Group";
import User from "App/Models/User";
import { GroupFactory, UserFactory } from "Database/factories";
import test from "japa";
import supertest from "supertest";

const BASEURL = `http://${process.env.HOST}:${process.env.PORT}`;
let token = "";
let user = {} as User;

test.group("Group", (group) => {
  test("it should create a group", async (assert) => {
    const user = await UserFactory.create();
    const groupPayload = {
      name: "test",
      description: "test",
      schedule: "test",
      location: "test",
      chronic: "test",
      master: user.id,
    };
    const { body } = await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send(groupPayload)
      .expect(201);

    assert.exists(body.group, "Grup undefined");
    assert.equal(body.group.name, groupPayload.name);
    assert.equal(body.group.description, groupPayload.description);
    assert.equal(body.group.schedule, groupPayload.schedule);
    assert.equal(body.group.location, groupPayload.location);
    assert.equal(body.group.chronic, groupPayload.chronic);
    assert.equal(body.group.master, groupPayload.master);
    assert.exists(body.group.players, "Players undefined");
    assert.equal(body.group.players.length, 1);
    assert.equal(body.group.players[0].id, groupPayload.master);
  });

  test("it should return 422 when required data is not provided", async (assert) => {
    const { body } = await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(422);
    assert.equal(body.code, "BAD_REQUEST");
    assert.equal(body.status, 422);
  });

  test("it should update a group", async (assert) => {
    const group = await GroupFactory.merge({ master: user.id }).create();
    const payload = {
      name: "test",
      description: "test",
      schedule: "test",
      location: "test",
      chronic: "test",
    };

    const { body } = await supertest(BASEURL)
      .patch(`/groups/${group.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload)
      .expect(200);

    assert.exists(body.group, "Group undefined");
    assert.equal(body.group.name, payload.name);
    assert.equal(body.group.description, payload.description);
    assert.equal(body.group.schedule, payload.schedule);
    assert.equal(body.group.location, payload.location);
    assert.equal(body.group.chronic, payload.chronic);
  });

  test("it should return 404 when providing an unexisting group for update", async (assert) => {
    const response = await supertest(BASEURL)
      .patch("/groups/1")
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(404);
    assert.equal(response.body.code, "BAD_REQUEST");
    assert.equal(response.body.status, 404);
  });

  //DELETE /groups/id_mesa/players/id_user
  test("it should remove user from group", async (assert) => {
    const group = await GroupFactory.merge({ master: user.id }).create();

    const plainPassword = "test";
    const newuser = await UserFactory.merge({
      password: plainPassword,
    }).create();
    const response = await supertest(BASEURL).post("/sessions").send({
      email: newuser.email,
      password: plainPassword,
    });

    const playertoken = response.body.token.token;

    const { body } = await supertest(BASEURL)
      .post(`/groups/${group.id}/requests`)
      .set("Authorization", `Bearer ${playertoken}`)
      .send({});

    await supertest(BASEURL)
      .post(`/groups/${group.id}/requests/${body.groupRequest.id}/accept`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    await supertest(BASEURL)
      .delete(`/groups/${group.id}/players/${newuser.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    await group.load("players");
    assert.isEmpty(group.players);
  });

  test("it should not remove the master of the group", async (assert) => {
    const groupPayload = {
      name: "test",
      description: "test",
      schedule: "test",
      location: "test",
      chronic: "test",
      master: user.id,
    };
    const { body } = await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send(groupPayload);

    const group = body.group;
    await supertest(BASEURL)
      .delete(`/groups/${group.id}/players/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    const groupModel = await Group.findOrFail(group.id);
    await groupModel.load("players");
    assert.isNotEmpty(group.players);
  });

  test("it should remove the group", async (assert) => {
    const groupPayload = {
      name: "test",
      description: "test",
      schedule: "test",
      location: "test",
      chronic: "test",
      master: user.id,
    };
    const { body } = await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send(groupPayload);

    const group = body.group;

    await supertest(BASEURL)
      .delete(`/groups/${group.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(200);

    const emptyGroup = await Database.query()
      .from("groups")
      .where("id", group.id);

    assert.isEmpty(emptyGroup);
    //consultando os relacionamentos
    const players = await Database.query().from("groups_users");
    assert.isEmpty(players);
  });

  test("it should return 404 providing an unexisting group for deletion", async (assert) => {
    const { body } = await supertest(BASEURL)
      .delete("/groups/123")
      .set("Authorization", `Bearer ${token}`)
      .send({})
      .expect(404);
    assert.equal(body.code, "BAD_REQUEST");
    assert.equal(body.status, 404);
  });

  test("it should return all groups when no query is provided to lits groups", async (assert) => {
    const groupPayload = {
      name: "test",
      description: "test",
      schedule: "test",
      location: "test",
      chronic: "test",
      master: user.id,
    };
    const response = await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send(groupPayload)
      .expect(201);
    const group = response.body.group;

    const { body } = await supertest(BASEURL)
      .get("/groups")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

      console.log(body);

    assert.exists(body.groups, "Groups undefined");
    assert.equal(body.groups.data.length, 1);
    assert.equal(body.groups.data[0].id, group.id);
    assert.equal(body.groups.data[0].name, group.name);
    assert.equal(body.groups.data[0].description, group.description);
    assert.equal(body.groups.data[0].location, group.location);
    assert.equal(body.groups.data[0].schedule, group.schedule);
    assert.exists(body.groups.data[0].masterUser, "Master undefined");
    assert.equal(body.groups.data[0].masterUser.id, user.id);
    assert.equal(body.groups.data[0].masterUser.username, user.username);
    assert.isNotEmpty(body.groups.data[0].players, "Empty players");
    assert.equal(body.groups.data[0].players[0].id, user.id);
    assert.equal(body.groups.data[0].players[0].email, user.email);
    assert.equal(body.groups.data[0].players[0].username, user.username);
  });

  test("it should return no groups by user id", async (assert) => {
    const groupPayload = {
      name: "test",
      description: "test",
      schedule: "test",
      location: "test",
      chronic: "test",
      master: user.id,
    };
    await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send(groupPayload)
      .expect(201);

    const { body } = await supertest(BASEURL)
      .get("/groups?user=123")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    assert.exists(body.groups, "Groups undefined");
    assert.equal(body.groups.data.length, 0);
  });

  test("it should return all groups by user id", async (assert) => {
    const groupPayload = {
      name: "test",
      description: "test",
      schedule: "test",
      location: "test",
      chronic: "test",
      master: user.id,
    };
    const response = await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send(groupPayload)
      .expect(201);
    const group = response.body.group;

    const { body } = await supertest(BASEURL)
      .get(`/groups?user=${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    assert.exists(body.groups, "Groups undefined");
    assert.equal(body.groups.data.length, 1);
    assert.equal(body.groups.data[0].id, group.id);
    assert.equal(body.groups.data[0].name, group.name);
    assert.equal(body.groups.data[0].description, group.description);
    assert.equal(body.groups.data[0].location, group.location);
    assert.equal(body.groups.data[0].schedule, group.schedule);
    assert.exists(body.groups.data[0].masterUser, "Master undefined");
    assert.equal(body.groups.data[0].masterUser.id, user.id);
    assert.equal(body.groups.data[0].masterUser.username, user.username);
    assert.isNotEmpty(body.groups.data[0].players, "Empty players");
    assert.equal(body.groups.data[0].players[0].id, user.id);
    assert.equal(body.groups.data[0].players[0].email, user.email);
    assert.equal(body.groups.data[0].players[0].username, user.username);
  });

  test("it should return all groups by user id and name", async (assert) => {
    const groupPayload = {
      name: "test",
      description: "test",
      schedule: "test",
      location: "test",
      chronic: "test",
      master: user.id,
    };
    const response = await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send(groupPayload)
      .expect(201);
    await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...groupPayload, name: "12345", description: "123456789" })
      .expect(201);
    const group = response.body.group;

    const { body } = await supertest(BASEURL)
      .get(`/groups?user=${user.id}&text=${group.name}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    assert.exists(body.groups, "Groups undefined");
    assert.equal(body.groups.data.length, 1);
    assert.equal(body.groups.data[0].id, group.id);
    assert.equal(body.groups.data[0].name, group.name);
    assert.equal(body.groups.data[0].description, group.description);
    assert.equal(body.groups.data[0].location, group.location);
    assert.equal(body.groups.data[0].schedule, group.schedule);
    assert.exists(body.groups.data[0].masterUser, "Master undefined");
    assert.equal(body.groups.data[0].masterUser.id, user.id);
    assert.equal(body.groups.data[0].masterUser.username, user.username);
    assert.isNotEmpty(body.groups.data[0].players, "Empty players");
    assert.equal(body.groups.data[0].players[0].id, user.id);
    assert.equal(body.groups.data[0].players[0].email, user.email);
    assert.equal(body.groups.data[0].players[0].username, user.username);
  });

  test("it should return all groups by user id and description", async (assert) => {
    const groupPayload = {
      name: "123",
      description: "test",
      schedule: "test",
      location: "test",
      chronic: "test",
      master: user.id,
    };
    const response = await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send(groupPayload)
      .expect(201);
    await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...groupPayload, name: "12345", description: "123456789" })
      .expect(201);
    const group = response.body.group;

    const { body } = await supertest(BASEURL)
      .get(`/groups?user=${user.id}&text=es`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    assert.exists(body.groups, "Groups undefined");
    assert.equal(body.groups.data.length, 1);
    assert.equal(body.groups.data[0].id, group.id);
    assert.equal(body.groups.data[0].name, group.name);
    assert.equal(body.groups.data[0].description, group.description);
    assert.equal(body.groups.data[0].location, group.location);
    assert.equal(body.groups.data[0].schedule, group.schedule);
    assert.exists(body.groups.data[0].masterUser, "Master undefined");
    assert.equal(body.groups.data[0].masterUser.id, user.id);
    assert.equal(body.groups.data[0].masterUser.username, user.username);
    assert.isNotEmpty(body.groups.data[0].players, "Empty players");
    assert.equal(body.groups.data[0].players[0].id, user.id);
    assert.equal(body.groups.data[0].players[0].email, user.email);
    assert.equal(body.groups.data[0].players[0].username, user.username);
  });

  test("it should return all groups by name", async (assert) => {
    const groupPayload = {
      name: "test",
      description: "123",
      schedule: "test",
      location: "test",
      chronic: "test",
      master: user.id,
    };
    const response = await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send(groupPayload)
      .expect(201);
    await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...groupPayload, name: "12345", description: "123456789" })
      .expect(201);
    const group = response.body.group;

    const { body } = await supertest(BASEURL)
      .get(`/groups?text=es`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    assert.exists(body.groups, "Groups undefined");
    assert.equal(body.groups.data.length, 1);
    assert.equal(body.groups.data[0].id, group.id);
    assert.equal(body.groups.data[0].name, group.name);
    assert.equal(body.groups.data[0].description, group.description);
    assert.equal(body.groups.data[0].location, group.location);
    assert.equal(body.groups.data[0].schedule, group.schedule);
    assert.exists(body.groups.data[0].masterUser, "Master undefined");
    assert.equal(body.groups.data[0].masterUser.id, user.id);
    assert.equal(body.groups.data[0].masterUser.username, user.username);
    assert.isNotEmpty(body.groups.data[0].players, "Empty players");
    assert.equal(body.groups.data[0].players[0].id, user.id);
    assert.equal(body.groups.data[0].players[0].email, user.email);
    assert.equal(body.groups.data[0].players[0].username, user.username);
  });

  test("it should return all groups by description", async (assert) => {
    const groupPayload = {
      name: "123",
      description: "test",
      schedule: "test",
      location: "test",
      chronic: "test",
      master: user.id,
    };
    const response = await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send(groupPayload)
      .expect(201);
    await supertest(BASEURL)
      .post("/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...groupPayload, name: "12345", description: "123456789" })
      .expect(201);
    const group = response.body.group;

    const { body } = await supertest(BASEURL)
      .get(`/groups?text=es`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    assert.exists(body.groups, "Groups undefined");
    assert.equal(body.groups.data.length, 1);
    assert.equal(body.groups.data[0].id, group.id);
    assert.equal(body.groups.data[0].name, group.name);
    assert.equal(body.groups.data[0].description, group.description);
    assert.equal(body.groups.data[0].location, group.location);
    assert.equal(body.groups.data[0].schedule, group.schedule);
    assert.exists(body.groups.data[0].masterUser, "Master undefined");
    assert.equal(body.groups.data[0].masterUser.id, user.id);
    assert.equal(body.groups.data[0].masterUser.username, user.username);
    assert.isNotEmpty(body.groups.data[0].players, "Empty players");
    assert.equal(body.groups.data[0].players[0].id, user.id);
    assert.equal(body.groups.data[0].players[0].email, user.email);
    assert.equal(body.groups.data[0].players[0].username, user.username);
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
