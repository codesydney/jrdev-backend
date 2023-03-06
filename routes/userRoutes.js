const express = require("express")

const {
  loginUser,
  signupUser,
  getUsers,
} = require("../controllers/userControllers")

const router = express.Router()

//* signup Route
router.post("/signup", signupUser)
router.post("/login", loginUser)
router.get("/test", getUsers)

module.exports = router
