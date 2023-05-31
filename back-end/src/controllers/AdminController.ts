import config from "../config";
import Color from "../model/Color.model";
import Rarity from "../model/Rarity.model";
import Type from "../model/Type.model";
import TileItem from "../model/TileItem.model";
import Featured from "../model/Featured.model";
import Advertisement from "../model/Advertisement.model";
import NftForItems from "src/model/NftForItems.model";
import { EMRServerless } from "aws-sdk";

export default class AdminController {
  static async loadData(req: any, res: any) {
    const colorData = await Color.findAll({
      attributes: ["id", "name"],
    });
    const typeData = await Type.findAll({
      attributes: ["id", "name", "shortName"],
    });
    const rarityData = await Rarity.findAll({
      attributes: ["id", "name", "color"],
    });
    const colorObj = {
      title: "Color",
      headers: [
        { text: "ID", value: "id" },
        { text: "Name", value: "name" },
        { text: "Action", value: "action" },
      ],
      items: colorData,
    };

    const typeObj = {
      title: "Type",
      headers: [
        { text: "ID", value: "id" },
        { text: "Name", value: "name" },
        { text: "ShortName", value: "shortName" },
        { text: "Action", value: "action" },
      ],
      items: typeData,
    };

    const rarityObj = {
      title: "Rarity",
      headers: [
        { text: "ID", value: "id" },
        { text: "Name", value: "name" },
        { text: "Color", value: "color" },
        { text: "Action", value: "action" },
      ],
      items: rarityData,
    };
    const returnData = [colorObj, typeObj, rarityObj];
    return res.json({ returnData });
  }
  static async addItem(req: any, res: any) {
    const { dataType, name, color, shortName } = req.body.willAddData;
    let newItem = null;
    switch (dataType) {
      case "color":
        newItem = await Color.create({ name });
        break;
      case "type":
        newItem = await Type.create({ name, shortName });
        break;
      case "rarity":
        newItem = await Rarity.create({ name, color });
        break;
      default:
        break;
    }

    return res.json({ dataType, newItem });
  }

  static async editData(req: any, res: any) {
    const { type, id, name, color, shortName } = req.body;
    console.log(type, id, name, color);
    let typeRecord = null;
    switch (type) {
      case 0:
        typeRecord = await Color.findByPk(id);
        typeRecord.name = name;
        await typeRecord.save();
        break;
      case 1:
        typeRecord = await Type.findByPk(id);
        typeRecord.name = name;
        typeRecord.shortName = shortName;
        await typeRecord.save();
        break;
      case 2:
        typeRecord = await Rarity.findByPk(id);
        typeRecord.name = name;
        typeRecord.color = color;
        await typeRecord.save();
        break;
      default:
        break;
    }

    return res.json({ editedData: typeRecord });
  }

  static async getCarousels(req: any, res: any) {
    const carousels = await Featured.findAll();
    const advertisement = await Advertisement.findAll();
    return res.json({ carousels, advertisement });
  }

  static async loadHistory(req: any, res: any) {
    try {
      const rowSpan = await NftForItems.count({
        // order: [["item_org_id", "ASC"]],
        group: "item_org_id",
      });
      const history = await NftForItems.findAll({
        order: [["item_org_id", "ASC"]],
        // group: "item_org_id",
      });
      let spanData = [];
      for (let span of rowSpan) {
        for (let i = 0; i < Number(span.count); i++) {
          spanData.push(span.count);
        }
      }
      return res.json({ history, spanData });
    } catch (err) {
      console.log(err);
      return res.status(405).json({ err });
    }
  }

  static async addCarousel(req: any, res: any) {
    const { imageUrl, typeHeading, mainHeading, subHeading } = req.body;
    const carousel = await Featured.create({
      imageUrl,
      typeHeading,
      mainHeading,
      subHeading,
    });

    return res.json({ carousel });
  }

  static async updateAd(req: any, res: any) {
    // const { title, content } = req.body;
    const title = req.body.title;
    const content = req.body.content;
    console.log("updated AD", req.body, req.body.title);
    console.log("rfgrf", title, content);
    // it is returning error right
    try {
      const advertisement = await Advertisement.findOne({ where: { id: 1 } });
      console.log(advertisement);
      advertisement.title = title;
      advertisement.content = content;
      advertisement.save();

      return res.json({ status: 0 });
    } catch (err) {
      console.log(err);
      return res.status(401).json({ status: 1 });
    }
  }

  static async setTileItem(req: any, res: any) {
    const { id } = req.body;
    const exist = await TileItem.findOne({ where: { item_id: id } });
    if (exist) {
      return res.json({ status: 0 });
    }
    const tileItem = await TileItem.create({ item_id: id });
    return res.json({ status: 1, tileItem });
  }

  static async deleteTileItem(req: any, res: any) {
    const { id } = req.body;
    await TileItem.destroy({ where: { item_id: id } });
    return res.json({ id });
  }

  static async getTileItems(req: any, res: any) {
    const tileItems = await TileItem.findAll();
    return res.json({ tileItems });
  }

  static async deleteData(req: any, res: any) {
    console.log(req.params.id, req.params.type);
    const id = req.params.id;
    const type = req.params.type;
    console.log(typeof type);
    let deletedRecord = null;
    switch (type) {
      case "0":
        deletedRecord = await Color.destroy({ where: { id: id } });
        break;
      case "1":
        deletedRecord = await Type.destroy({ where: { id: id } });
        break;
      case "2":
        deletedRecord = await Rarity.destroy({ where: { id: id } });
        break;
      default:
        break;
    }
    console.log(deletedRecord);
    return res.json({ deletedId: id });
  }
}
