import Route from "@ioc:Adonis/Core/Route";

Route.get("/", async () => {
  return { message: "hello world" };
});

//users
Route.post("/users", "UsersController.store");
Route.put("/users/:id", "UsersController.update").middleware("auth");

//password
Route.post("/forgot-password", "PasswordsController.forgotPassword");
Route.post("/reset-password", "PasswordsController.resetPassword");

//auth, sessions, login
Route.post("/sessions", "SessionsController.store");
Route.delete("/sessions", "SessionsController.destroy");

//tables -> messas
Route.post("/groups", "GroupsController.store").middleware("auth");

//solicitação para entrar nas mesa
Route.post(
  "/groups/:groupId/requests",
  "GroupRequestsController.store"
).middleware("auth");

Route.get("/groups/:groupId/requests", "GroupRequestsController.index");

Route.post(
  "/groups/:groupId/requests/:requestId/accept",
  "GroupRequestsController.accept"
);

Route.delete(
  "/groups/:groupId/requests/:requestId",
  "GroupRequestsController.destroy"
);
