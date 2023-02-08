import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import BadRequest from "App/Exceptions/BadRequestException";
import User from "App/Models/User";
import CreateUserValidator from "App/Validators/CreateUserValidator";

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    // const userPayload = request.only(['email', 'username', 'password', 'avatar',]);

    const userPayload = await request.validate(CreateUserValidator);

    const userByEmail = await User.findBy("email", userPayload.email);
    if (userByEmail) {
      throw new BadRequest("email already in use", 409);
    }

    const userByUserName = await User.findBy("username", userPayload.username);

    if (userByUserName) {
      throw new BadRequest("username already in use", 409);
    }

    const user = await User.create(userPayload);
    return response.created({ user });
  }


  public async update({request, response} : HttpContextContract) {
    const {email, password, avatar} = request.only(['email', 'avatar', 'password']);
    const id = request.param('id');
    const user = await User.findOrFail(id);

    user.email = email;
    user.password = password;
    if(avatar){
      user.avatar = avatar;
    }
    await user.save();
    return response.ok({user});
  }
}
