const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { validationResult } = require("express-validator")


const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const nav = await utilities.getNav()

  if (data.length > 0) {
    const className = data[0].classification_name
    const grid = await utilities.buildClassificationGrid(data)
    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    })
  } else {
    res.render("./inventory/classification", {
      title: "No vehicles found",
      nav,
      grid: '<p class="notice">No vehicles found for this classification.</p>',
    })
  }
}

invCont.buildDetailView = async function (req, res, next) {
  const inv_id = req.params.invId
  try {
    const data = await invModel.getInventoryById(inv_id)
    const nav = await utilities.getNav()
    const vehicleView = utilities.buildDetailView(data)

    res.render("./inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      vehicleView
    })
  } catch (error) {
    console.error("Error en buildDetailView", error)
    next(error)
  }
}

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages: req.flash(), // message flash
  })
}

invCont.buildAddClassificationView = async function(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

invCont.addClassification = async function(req, res, next) {
  const { classification_name } = req.body
  const errors = validationResult(req)

  let nav = await utilities.getNav()

  if (!errors.isEmpty()) {
    // En caso de tener errores de validación, muestra el formulario con mensajes
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
      classification_name,
    })
  }

  try {
    const regResult = await invModel.addClassification(classification_name)
    if (regResult) {
      // Actualiza la barra de navegación con la nueva clasificación
      nav = await utilities.getNav()

      req.flash("notice", `New classification "${classification_name}" added successfully.`)
      return res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash()
      })
    }
  } catch (error) {
    console.error("Error in addClassification:", error)
    req.flash("notice", "Sorry, there was a problem adding the classification.")
    return res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      classification_name,
    })
  }
}

invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList() // sin selección porque es el formulario vacío

  res.render("./inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    errors: null,
    message: null,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "",
    inv_thumbnail: "",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
  })
}

invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    classification_id, inv_make, inv_model, inv_year,
    inv_description, inv_image, inv_thumbnail,
    inv_price, inv_miles, inv_color
  } = req.body

  const errors = validationResult(req)
  const classificationList = await utilities.buildClassificationList(classification_id) // pasamos el seleccionado

  if (!errors.isEmpty()) {
    return res.status(400).render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: errors.array(),
      message: null,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
  }

  const result = await invModel.addInventory(
    classification_id, inv_make, inv_model, inv_year,
    inv_description, inv_image, inv_thumbnail,
    inv_price, inv_miles, inv_color
  )

  if (result) {
    req.flash("notice", `${inv_make} ${inv_model} was successfully added.`)
    res.redirect("/inv")
  } else {
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      message: null,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
  }
}


module.exports = invCont