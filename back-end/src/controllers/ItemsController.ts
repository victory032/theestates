import { fstat, read } from "fs";
import config from "../config";
import { getListObjects, uploadFile, emptyBucket } from "../services/aws";
import EstateItems from "src/model/EstateItems.model";
import NftForItems from "src/model/NftForItems.model";
import Advertisement from "src/model/Advertisement.model";
import fs from "fs";
import Type from "../model/Type.model";
import Color from "../model/Color.model";
import Rarity from "../model/Rarity.model";
import TileItem from "../model/TileItem.model";

const formatID = (shortName: string, length: number) => {
  let s = length + "";
  while (s.length < 5) s = "0" + s;
  return shortName + s;
};
export default class ItemsController {
  static index(req: any, res: any) {
    return res.json("Successed");
  }
  static async getAllItems(req: any, res: any) {
    const itemsData = await EstateItems.findAll({
      include: [Type, Color, Rarity],
    });
    const tileItems = await TileItem.findAll();
    const advertisement = await Advertisement.findOne({ where: { id: 1 } });
    return res.json({ itemsData, tileItems, advertisement });
  }

  static async emptyItemsBucket(req: any, res: any) {
    const result = await emptyBucket(config.ITEM_BUCKET_NAME);
    const result2 = await emptyBucket(config.ITEM_METADATA_BUCKET_NAME);
    return res.json({ result, result2 });
  }

  static async selectToken(req: any, res: any) {
    const tokenId = req.params.id;
    const itemsAssociatedToken = await NftForItems.findAll({
      where: { nft_id: tokenId },
      include: [{ model: EstateItems, attributes: ["name", "image_url"] }],
    });

    return res.json({ associatedItems: itemsAssociatedToken });
  }

  static async loadData(req: any, res: any) {
    const colorData = await Color.findAll({
      attributes: ["id", "name"],
    });
    const typeData = await Type.findAll({
      attributes: ["id", "name"],
    });
    const rarityData = await Rarity.findAll({
      attributes: ["id", "name", "color"],
    });

    return res.json({ colorData, typeData, rarityData });
  }

  static async getTileItemsData(req: any, res: any) {
    const tileItems = await TileItem.findAll({
      include: [{ model: EstateItems, include: [Type, Color, Rarity] }],
    });

    return res.json({ tileItems });
  }

  static async getPopularItems(req: any, res: any) {
    const popularItems = await EstateItems.findAll({
      order: [["sold_amount", "DESC"]],
      include: [Type, Color, Rarity],
      limit: 5,
    });
    return res.json({ popularItems });
  }

  static async editItem(req: any, res: any) {
    const {
      id,
      name,
      description,
      price,
      colorId,
      typeId,
      rarityId,
      discountRate,
      currencyType,
    } = req.body;

    try {
      const updatedRecord = await EstateItems.findOne({ where: { id: id } });
      updatedRecord.name = name;
      updatedRecord.description = description;
      updatedRecord.price = price;
      updatedRecord.color_id = colorId;
      updatedRecord.type_id = typeId;
      updatedRecord.rarity_id = rarityId;
      updatedRecord.reduction_rate = discountRate;
      updatedRecord.currency_type = currencyType === true ? 1 : 0;
      updatedRecord.save();
      return res.json({ updatedRecord });
    } catch (err) {
      console.log(err);
      return res.status(401).json({ result: err });
    }
  }

  static async buyItem(req: any, res: any) {
    try {
      const { itemId, itemOrganizeId, owner, nftId, nftName, tx } = req.body;
      const estateItem = await EstateItems.findOne({ where: { id: itemId } });

      if (
        estateItem.quantity !== -1 &&
        estateItem.quantity !== null &&
        estateItem.quantity <= estateItem.sold_amount
      ) {
        return res.json({ status: 0 });
      }

      estateItem.sold_amount++;
      estateItem.save();

      await NftForItems.create({
        nft_id: nftId,
        item_org_id: itemOrganizeId,
        item_id: itemId,
        owner: owner,
        nft_name: nftName,
        tx: tx,
      });

      const itemRecord = await NftForItems.findOne({
        where: { item_id: itemId },
        include: [{ model: EstateItems, attributes: ["name", "image_url"] }],
      });

      return res.json({ status: 1, estateItem, itemRecord });
    } catch (err) {
      console.log(err);
      return res.status(405).json(err);
    }
  }

  static async uploadItem(req: any, res: any) {
    try {
      const items = await getListObjects(config.ITEM_BUCKET_NAME);
      const metadatas = await getListObjects(config.ITEM_METADATA_BUCKET_NAME);
      // extension of files
      if (!req.files["image"]) {
        return res.status(401).json({ err: "Invalid form data-image" });
      }

      const ext_image = req.files["image"][0].mimetype.split("/")[1];
      const ext_model = "glb";

      //prefix-unique numbers: 1,2,3...
      const uid = Math.ceil(items?.Contents.length / 2);
      const imgName = `${uid}_img_${config.UNIQUE_ITEM_SUFIX}.${ext_image}`;
      const modelName = `${uid}_glb_${config.UNIQUE_ITEM_SUFIX}.${ext_model}`;
      const metaName = `${uid}_${config.UNIQUE_META_SUFIX}.json`;

      //uploading files to s3 bucket
      await uploadFile(
        req.files["image"][0].path,
        config.ITEM_BUCKET_NAME,
        imgName
      );

      await uploadFile(
        req.files["model"][0].path,
        config.ITEM_BUCKET_NAME,
        modelName
      );

      const shortName = (await Type.findOne({ where: { id: req.body.type } }))
        .shortName;
      const length = (
        await EstateItems.findAll({ where: { type_id: req.body.type } })
      ).length;
      console.log(formatID(shortName, length));
      const itemMeta = {
        id: formatID(shortName, length),
        name: req.body.itemName,
        description: req.body.itemDesc,
        price: req.body.price,
        type: req.body.type,
        color: req.body.color,
        rarity: req.body.rarity,
        quantity: req.body.quantity,
        start_date: req.body.dateValue[0],
        end_date: req.body.dateValue[1],
        currency_type: req.body.currencyType === "true" ? 1 : 0,
      };

      const jsonString = JSON.stringify(itemMeta);
      fs.writeFileSync("public/metadata/itemMeta.json", jsonString);
      fs.readFileSync("public/metadata/itemMeta.json").toString();
      const metaLocation = await uploadFile(
        "public/metadata/itemMeta.json",
        config.ITEM_METADATA_BUCKET_NAME,
        metaName
      );

      console.log(
        "------------Meta data json file uploading succeed-----------"
      );

      const dateRange = req.body.dateValue.split(",");
      const today = new Date().toISOString().slice(0, 19).replace("T", " ");
      console.log(
        "vayke",
        req.body.dateValue,
        "vaule",
        req.body.dateValue ? dateRange[0] : today
      );
      await EstateItems.create({
        name: req.body.itemName,
        organizedId: formatID(shortName, length),
        description: req.body.itemDesc,
        price: req.body.price,
        color_id: req.body.color,
        type_id: req.body.type,
        rarity_id: req.body.rarity,
        quantity: req.body.quantity,
        currency_type: req.body.currencyType === "true" ? 1 : 0,
        start_date: req.body.dateValue.length !== 0 ? dateRange[0] : today,
        end_date: req.body.dateValue.length !== 0 ? dateRange[1] : today,
        image_url: config.CLOUDFRONT_ITEMS + imgName,
        model_url: config.CLOUDFRONT_ITEMS + modelName,
        meta_url: config.CLOUDFRONT_META + metaName,
      });

      return res.json({ result: true });
    } catch (err) {
      console.log(err);
      return res.status(403).json({ err });
    }
  }
}
