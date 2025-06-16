const router = require("express").Router();
const user = require("../controllers/userAuth");

router.post("/create", user.createUser);
router.post("/login", user.login);
router.delete("/delete", user.deleteUser);

module.exports = router;
