import { Table, Model, Column, DataType } from "sequelize-typescript";

@Table({})
class Type extends Model<Type> {
  @Column({
    allowNull: false,
  })
  name: string;

  @Column({
    allowNull: false,
  })
  shortName: string;
}

export default Type;
