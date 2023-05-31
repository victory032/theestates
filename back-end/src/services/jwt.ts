import jwt from "jsonwebtoken";
import config from "../config";

export default (req: any, res: any, next: any) => {
  let token: any;
  if (req.headers.authentication) {
    token = req.headers.authentication;
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }
  if (token) {
    try {
      req.user = jwt.verify(token, config.APP_SECRET);
    } catch (err) {
      res.status(401).send({ error: err.message });
    }
  }

  next();
};
