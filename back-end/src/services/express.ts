import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
export default (routes: any) => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use("/api", routes);
  return app;
};
