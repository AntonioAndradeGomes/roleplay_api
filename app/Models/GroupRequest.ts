import { DateTime } from "luxon";
import { BaseModel, belongsTo, BelongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import User from "./User";
import Group from "./Group";

export default class GroupRequest extends BaseModel {
  public static table = 'groups_requests';

  @column({ isPrimary: true })
  public id: number;

  @column({ columnName: "user_id" })
  public userId: number;

  @belongsTo(() => User, {
    foreignKey: "user_id",
  })
  public user: BelongsTo<typeof User>;

  @belongsTo(() => Group, {
    foreignKey: "group_id",
  })
  public group: BelongsTo<typeof Group>;

  @column({ columnName: "group_id" })
  public groupId: number;

  @column()
  public status: string;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
