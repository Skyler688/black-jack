const router = require("express").Router();
const user = require("../controllers/userAuth");

router.post("/create", user.createUser);
router.post("/login", user.login);
router.post("/check", user.cookieCheck);
router.post("/logout", user.logout);
router.post("/buy", user.buyIn);
router.post("/cashout", user.cashout);

module.exports = router;
