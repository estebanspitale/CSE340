const express = require("express")
const router = express.Router()
const errorController = require("../controllers/errorController")

// Ruta que lanza un error
router.get("/test", errorController.triggerError)

module.exports = router