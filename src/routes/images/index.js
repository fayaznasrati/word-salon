import express from "express";
import passport from "passport";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/users/:id/:name", (req, res) => {
  try {
    const id = req.params.id;
    const fileName = req.params.name;
    const filePath = path.resolve(process.cwd(), `./public/images/users/${id}/${fileName}`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: "File not found" });
    }

    res.setHeader("Content-Type", "image/*");
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

router.get("/:name", (req, res) => {
  try {
    const fileName = req.params.name;
    const filePath = path.resolve(process.cwd(), `./public/images/${fileName}`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send({ message: "File not found" });
    }

    res.setHeader("Content-Type", "image/*");
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
});

export default router;