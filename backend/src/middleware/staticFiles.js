import fs from "fs";
import express from "express";
import config from "../config/index.js";
import path from "path";

export const serveStaticFiles = () => {
  return express.static(config.paths.images);
};

export const serveDefaultImage = (req, res, next) => {
  const filePath = path.join(config.paths.images, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.redirect(`${config.baseUrl}/assets/images/products/default.png`);
  }
  next();
};
