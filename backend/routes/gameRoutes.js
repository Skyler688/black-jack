const router = require("express").Router();
const game = require("../controllers/gamePlay");

router.post("/deal", game.deal);
router.post("/reset", game.reset);
router.delete("/remove/deck", game.removeDeck);

module.exports = router;
