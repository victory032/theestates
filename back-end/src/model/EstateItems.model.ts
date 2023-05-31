import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Type from "./Type.model";
import Color from "./Color.model";
import Rarity from "./Rarity.model";

@Table({})
class EstateItems extends Model<EstateItems> {
  @Column({
    allowNull: false,
  })
  name: string;

  @Column({
    allowNull: false,
  })
  organizedId: string;

  @Column({
    allowNull: false,
  })
  description: string;

  @Column({
    allowNull: false,
    type: DataType.DECIMAL(10, 3),
  })
  price: number;

  @ForeignKey(() => Type)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  type_id: number;

  @ForeignKey(() => Color)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  color_id: number;

  @ForeignKey(() => Rarity)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  rarity_id: number;

  @Column({
    allowNull: false,
  })
  image_url: string;

  @Column({
    allowNull: false,
  })
  model_url: string;

  @Column({
    allowNull: false,
  })
  meta_url: string;

  @Column({
    allowNull: true,
  })
  associated_nft_id: number;

  @Column({
    allowNull: true,
  })
  associated_nft_name: string;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    defaultValue: -1,
  })
  quantity: number;

  @Column({
    allowNull: true,
    type: DataType.DATE,
  })
  start_date: string;

  @Column({
    allowNull: true,
    type: DataType.DATE,
  })
  end_date: string;

  @Column({
    allowNull: false,
    type: DataType.TINYINT,
  })
  currency_type: number;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  sold_amount: number;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  reduction_rate: number;

  @BelongsTo(() => Type, { onDelete: "CASCADE" })
  type: Type;

  @BelongsTo(() => Color, { onDelete: "CASCADE" })
  color: Color;

  @BelongsTo(() => Rarity, { onDelete: "CASCADE" })
  rarity: Rarity;
}

export default EstateItems;
