const r = require("express").Router();
const c = require("../controllers/farm.controller");
const auth = require("../middleware/auth");
const upload = require('../middleware/upload');

r.get("/", c.list);
r.get("/mine", auth(["owner"]), c.mine);
// r.post("/", auth(["admin", "owner"]), c.create);
r.post(
  "/",
  auth(["admin", "owner"]),
  upload.single("image"),
  c.create
);

r.put("/:id", auth(["admin", "owner"]), c.update);
r.delete("/:id", auth(["admin", "owner"]), c.remove);
module.exports = r;
