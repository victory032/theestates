import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({})
class Rarity extends Model<Rarity> {
  @Column({
    allowNull: false,
  })
  name: string;

  @Column({
    allowNull: false,
  })
  color: string;
}

export default Rarity;
