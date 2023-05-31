import { Router } from "express";
import Controllers from "../controllers";
import { authenticate } from "./middleware";
import multer from "multer";
import jwt from "../services/jwt";

const router = Router();
const multerStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "public/multidata");
  },
  filename: (req: any, file: any, cb: any) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, file.fieldname + "." + ext);
  },
});
const upload = multer({ storage: multerStorage });
// Shopping mall routes
router.get("/", Controllers.Items.index);
router.get("/items", Controllers.Items.getAllItems);
router.post("/buy-item", Controllers.Items.buyItem);
router.get("/items/selected/:id", Controllers.Items.selectToken);
router.get("/customer/load-data", Controllers.Items.loadData);
router.get("/get-carousels", Controllers.Admin.getCarousels);
router.get("/get-popular-items", Controllers.Items.getPopularItems);
router.post("/update-advertisement", Controllers.Admin.updateAd);
router.get("/get-tile-item-data", Controllers.Items.getTileItemsData);
// Admin routes
router.post("/login", Controllers.Auth.login);

router.use(jwt);
router.use(authenticate());

const cpUplaod = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "model", maxCount: 1 },
]);
router.post("/set-tile-item", Controllers.Admin.setTileItem);
router.post("/delete-tile-item", Controllers.Admin.deleteTileItem);
router.get("/get-tile-items", Controllers.Admin.getTileItems);
router.post("/upload-item", cpUplaod, Controllers.Items.uploadItem);
router.post("/delete-bucket", Controllers.Items.emptyItemsBucket);
router.post("/edit-item", Controllers.Items.editItem);
router.post("/add-item", Controllers.Admin.addItem);
router.get("/load-data", Controllers.Admin.loadData);
router.post("/edit-data", Controllers.Admin.editData);
router.get("/load-history", Controllers.Admin.loadHistory);
router.post("/add-carousel", Controllers.Admin.addCarousel);
router.delete("/delete-data/:type/:id", Controllers.Admin.deleteData);

export default router;
