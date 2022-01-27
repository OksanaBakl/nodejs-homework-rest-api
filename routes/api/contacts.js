const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares");

const ctrl = require("../../controllers/contacts");

router.get("/", authenticate, ctrl.getAll);

router.get("/:id", authenticate, ctrl.getById);

router.post("/", authenticate, ctrl.add);

router.delete("/:id", authenticate, ctrl.removeById);

router.put("/:id", authenticate, ctrl.updateById);

router.patch("/:contactId/favorite", authenticate, ctrl.updateFavorite);

module.exports = router;
