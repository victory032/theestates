import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({})
class Featured extends Model<Featured> {
  @Column({
    allowNull: false,
  })
  imageUrl: string;

  @Column({
    allowNull: false,
  })
  typeHeading: string;

  @Column({
    allowNull: false,
  })
  mainHeading: string;

  @Column({
    allowNull: false,
  })
  subHeading: string;
}

export default Featured;
