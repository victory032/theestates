import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({
  updatedAt: false,
})
class User extends Model<User> {
  @Column({
    allowNull: false,
  })
  email: string;

  @Column({
    allowNull: false,
  })
  password: string;
}

export default User;
