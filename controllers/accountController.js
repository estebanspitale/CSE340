const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

async function registerAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  let nav = await utilities.getNav()

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    return res.redirect("/account/login")
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    return res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  // Si no se encuentra el usuario
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    // Comparar la contraseña con la hasheada
    const match = await bcrypt.compare(account_password, accountData.account_password)
    if (match) {
      // No enviar la contraseña al cliente
      delete accountData.account_password

      // Generar el token
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

      // Guardar token como cookie segura si estamos en producción
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600 * 1000
      })

      console.log("JWT cookie set:", accessToken)

      // Redirigir al dashboard
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    throw new Error('Access Forbidden')
  }
}


/* ****************************************
 *  Deliver Account Management View
 * ************************************ */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/account", {
    title: "Account Management",
    nav,
    errors: null,
    messages: req.flash(),
    accountData: res.locals.accountData
  })
}

// Mostrar formulario para actualizar cuenta
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav()
  const account_id = req.params.account_id

  try {
    const accountData = await accountModel.getAccountById(account_id)
    if (!accountData) {
      req.flash("error", "Account not found.")
      return res.redirect("/account/")
    }

    res.render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      accountData,
    })
  } catch (error) {
    throw error
  }
}

// Procesar actualización de cuenta
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  try {
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (updateResult) {
      req.flash("notice", "Account successfully updated.")
      return res.redirect("/account/")
    } else {
      req.flash("error", "Update failed.")
      return res.status(501).render("account/update-account", {
        title: "Update Account",
        nav,
        errors: null,
        accountData: req.body,
      })
    }
  } catch (error) {
    throw error
  }
}

// Procesar cambio de contraseña
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)

    const result = await accountModel.updatePassword(account_id, hashedPassword)

    if (result) {
      req.flash("notice", "Password updated successfully.")
      return res.redirect("/account/")
    } else {
      req.flash("error", "Password update failed.")
      const accountData = await accountModel.getAccountById(account_id)
      return res.status(501).render("account/update-account", {
        title: "Update Account",
        nav,
        errors: null,
        accountData,
      })
    }
  } catch (error) {
    throw error
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
}