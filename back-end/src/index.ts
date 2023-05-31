import http from "http";
import { connectToNode } from "./services/aws";
import config from "./config";
import routes from "./routes";
import "./model";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
//Initialized all services
//Created express instance
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", routes);
const server = http.createServer(app);
connectToNode();
server.listen(config.PORT, () => {
  return console.log("Server is listening on port %d", config.PORT);
});
