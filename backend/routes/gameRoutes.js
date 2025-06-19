const router = require("express").Router();
const game = require("../controllers/gamePlay");

router.post("/deal", game.deal);
router.post("/reset", game.reset);
router.delete("/remove/deck", game.removeDeck);

router.post("/start", game.startGame);
router.post("/bet", game.placeBet);

module.exports = router;
