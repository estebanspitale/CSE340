const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
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

module.exports = invCont