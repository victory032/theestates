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
class NftForItems extends Model<NftForItems> {
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  nft_id: number;

  @Column({
    allowNull: false,
  })
  nft_name: string;

  @ForeignKey(() => EstateItems)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  item_id: number;

  @Column({
    allowNull: false,
  })
  item_org_id: string;

  @Column({
    allowNull: false,
  })
  owner: string;

  @Column({
    allowNull: false,
  })
  tx: string;

  @BelongsTo(() => EstateItems, { onDelete: "CASCADE" })
  item: EstateItems;
}

export default NftForItems;
