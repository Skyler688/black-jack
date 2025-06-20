const router = require("express").Router();
const game = require("../controllers/gamePlay");

router.post("/start", game.startGame);
router.post("/bet", game.placeBet);
router.post("/hit", game.hit);

module.exports = router;
