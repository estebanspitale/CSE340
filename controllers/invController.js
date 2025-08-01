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

  const classificationList = await utilities.buildClassificationList()

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationList,
    messages: req.flash(), 
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
  const classificationList = await utilities.buildClassificationList(classification_id)

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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)

    if (Array.isArray(invData) && invData.length > 0 && invData[0].inv_id) {
      return res.json(invData)
    } else {
      // Devuelve un array vacío en lugar de lanzar error
      return res.status(200).json([])
    }
  } catch (error) {
    console.error("Error fetching inventory JSON:", error)
    return res.status(500).json({ message: "Error retrieving inventory data." })
  }
}

invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const invId = req.params.invId
    const data = await invModel.getInventoryById(invId)
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(data.classification_id)

    res.render("inventory/edit-inventory", {
      title: `Edit ${data.inv_make} ${data.inv_model}`,
      nav,
      classificationList,
      errors: null,
      message: null,
      inv_id: data.inv_id,
      inv_make: data.inv_make,
      inv_model: data.inv_model,
      inv_year: data.inv_year,
      inv_description: data.inv_description,
      inv_image: data.inv_image,
      inv_thumbnail: data.inv_thumbnail,
      inv_price: data.inv_price,
      inv_miles: data.inv_miles,
      inv_color: data.inv_color,
      classification_id: data.classification_id,
    })
  } catch (error) {
    console.error("Error building edit inventory view:", error)
    next(error)
  }
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  try {
  // Obtiene datos actuales
  const currentData = await invModel.getInventoryById(inv_id)

  // Compara si hay cambios
  if (
    currentData.inv_make === inv_make &&
    currentData.inv_model === inv_model &&
    currentData.inv_description === inv_description &&
    currentData.inv_image === inv_image &&
    currentData.inv_thumbnail === inv_thumbnail &&
    Number(currentData.inv_price) === Number(inv_price) &&
    Number(currentData.inv_year) === Number(inv_year) &&
    Number(currentData.inv_miles) === Number(inv_miles) &&
    currentData.inv_color === inv_color &&
    Number(currentData.classification_id) === Number(classification_id)
  ) {
    req.flash("notice", `No changes detected. The item was not updated.`)
    return res.redirect("/inv/")
  }

  // Si hay cambios, hace update
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

} catch (error) {
  console.error("Error updating inventory:", error)
  next(error)
}
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  try {
    const nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      message: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price,
    })
  } catch (error) {
    console.error("Error building delete confirmation view:", error)
    next(error)
  }
}

/* ***************************
 *  Process deletion of inventory item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  let nav = await utilities.getNav()

  try {
    const deleteResult = await invModel.deleteInventory(inv_id)

    if (deleteResult) {
      req.flash("notice", "The inventory item was successfully deleted.")
      return res.redirect("/inv")
    } else {
      req.flash("notice", "Sorry, the delete failed.")
      return res.redirect(`/inv/delete/${inv_id}`)
    }
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    req.flash("notice", "An unexpected error occurred.")
    return res.redirect(`/inv/delete/${inv_id}`)
  }
}


/* ***************************
 *  Process deletion of inventory item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  try {
    const deleteResult = await invModel.deleteInventory(inv_id)
    const nav = await utilities.getNav()

    if (deleteResult) {
      req.flash("notice", "The inventory item was successfully deleted.")
    } else {
      req.flash("notice", "Sorry, the delete failed.")
    }

    res.redirect("/inv")
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    next(error)
  }
}


module.exports = invCont