import User from "../model/User.model";
import jwt from "jsonwebtoken";
import config from "../config";

export default class AuthController {
  static async login(req: any, res: any) {
    const { email, password } = req.body;
    console.log(email, password);
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json({
          type: 1,
          text: "This email address is not registered!",
        });
      }

      if (user.password !== password) {
        return res.json({ type: 2, text: "Password is invalid" });
      }
      console.log(typeof config.APP_SECRET, typeof config.JWT_EXPIRE);
      const token = jwt.sign({ email: user.email }, config.APP_SECRET, {
        expiresIn: config.JWT_EXPIRE,
      });

      return res.json({ type: 0, text: token });
    } catch (err) {
      console.log(err);
      return res.status(401).json(err);
    }
  }
}
