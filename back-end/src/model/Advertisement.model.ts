import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({})
class Advertisement extends Model<Advertisement> {
  @Column({
    allowNull: false,
  })
  title: string;

  @Column({
    allowNull: false,
  })
  content: string;
}

export default Advertisement;
