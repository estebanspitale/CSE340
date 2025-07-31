const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Route to login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Register
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to process registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Account management view (después del login)
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

module.exports = router