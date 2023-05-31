import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import EstateItems from "./EstateItems.model";
@Table({})
class TileItem extends Model<TileItem> {
  @ForeignKey(() => EstateItems)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  item_id: number;

  @BelongsTo(() => EstateItems, { onDelete: "CASCADE" })
  item: EstateItems;
}

export default TileItem;
