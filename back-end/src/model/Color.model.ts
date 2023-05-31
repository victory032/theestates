import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({})
class Color extends Model<Color> {
  @Column({
    allowNull: false,
  })
  name: string;
}

export default Color;
