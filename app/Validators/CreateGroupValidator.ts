import { schema } from "@ioc:Adonis/Core/Validator";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class CreateGroupValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    name: schema.string({}),
    description: schema.string({}),
    schedule: schema.string({}),
    location: schema.string({}),
    chronic: schema.string({}),
    master: schema.number(),
  });

  public messages = {};
}
