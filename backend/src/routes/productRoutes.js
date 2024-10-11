import express from "express";
import multer from "multer";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByRankingAndPromotion,
  uploadProductImage,
} from "../controllers/productsController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/images/products");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/products", getAllProducts);

router.post("/products/create", createProduct);

router.post("/products/update", updateProduct);

router.delete("/products/:id", deleteProduct);

router.get("/products/ranking-promotion", getProductsByRankingAndPromotion);

router.post(
  "/products/upload-image",
  upload.single("file"),
  uploadProductImage
);

export default router;
