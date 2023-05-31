import { Sequelize } from "sequelize-typescript";
import config from "../config";

const sequelize = new Sequelize({
  username: config.DB_USERNAME,
  password: config.DB_PASSWORD || "",
  database: config.DB_DATABASE,
  host: config.DB_HOST,
  dialect: config.DB_CONNECTION,
  modelPaths: [__dirname + "/**/*.model.{ts, js}"],
  logging: false,
});

try {
  sequelize
    .sync({ force: false })
    .then((res: any) => {
      console.log("Sequelize sync succeed");
    })
    .catch((err: any) => console.log("==========", err));
} catch (err) {
  console.log("servererror", err);
}
export default sequelize;
