const router = require("express").Router();
const user = require("../controllers/userAuth");

router.post("/create", user.createUser);
router.post("/login", user.login);
router.post("/pass/validation", user.changePassValidation);
router.post("/pass/change", user.changePass);
router.get("/logout", user.logout);
router.delete("/delete", user.deleteUser);

module.exports = router;
