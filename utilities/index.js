const Util = {}
const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
************************************** */
Util.buildClassificationGrid = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<div class="inv-grid">'
    data.forEach(vehicle => {
      grid += `
        <div class="inv-card">
          <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
          </a>
          <p class="vehicle-name">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</p>
          <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
        </div>
      `
    })
    grid += '</div>'
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
 * Build the vehicle detail view HTML
 **************************************** */
Util.buildDetailView = function (vehicle) {
  let view = `
    <section class="vehicle-detail-wrapper">
      <h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
      <div class="vehicle-detail">
        <div class="vehicle-img">
          <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        </div>
        <div class="vehicle-specs">
          <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
          <p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
          <p><strong>Description:</strong> ${vehicle.inv_description}</p>
          <p><strong>Color:</strong> ${vehicle.inv_color}</p>
          <p><strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</p>
        </div>
      </div>
    </section>
  `
  return view
}

/* ****************************************
 * Build the classification <select> list
 **************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList = '<select name="classification_id" id="classificationList" required>'
  classificationList += '<option value="">Choose a Classification</option>'
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`
    if (classification_id && row.classification_id.toString() === classification_id.toString()) {
      classificationList += ' selected'
    }
    classificationList += `>${row.classification_name}</option>`
  })
  classificationList += '</select>'
  return classificationList
}

/* ****************************************
 * Middleware to check if user is logged in
 **************************************** */
Util.checkLogin = (req, res, next) => {
  const token = req.cookies.jwt
  if (!token) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.accountData = decoded
    res.locals.loggedin = true
    next()
  } catch (error) {
    req.flash("notice", "Session expired. Please log in again.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 * Middleware to store accountData in res.locals
 * so it's usable in EJS views
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        req.session.loggedin = false
        req.session.accountData = null
        res.locals.loggedin = false
        res.locals.accountData = null
        return next()
      }
      req.session.loggedin = true
      req.session.accountData = decoded
      res.locals.loggedin = true
      res.locals.accountData = decoded
      return next()
    })
  } else {
    req.session.loggedin = false
    req.session.accountData = null
    res.locals.loggedin = false
    res.locals.accountData = null
    return next()
  }
}

Util.checkAccountType = (req, res, next) => {
  const accountData = res.locals.accountData

  if (!accountData) {
    // No está logueado
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }

  const allowedTypes = ["Employee", "Admin"]

  if (allowedTypes.includes(accountData.account_type)) {
    return next()
  } else {
    req.flash("notice", "You do not have permission to access that area.")
    return res.redirect("/account/login")
  }
}


module.exports = Util
