const { body, validationResult } = require("express-validator")
const validate = {}

// Rules for adding a new vehicle
validate.inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters long."),
    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters long."),
    body("inv_year")
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Year must be a valid number between 1900 and 2100."),
    body("inv_description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters."),
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Image path is required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive whole number."),
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),
    body("classification_id")
      .isInt()
      .withMessage("A classification must be selected."),
  ]
}

// Check for errors and return
validate.checkInventoryData = async (req, res, next) => {
  const { 
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, 
    inv_color, classification_id
  } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const utilities = require("./index")
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)

    return res.status(400).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      errors: errors.array(),
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id, // ← faltaba este
    })
  }

  next()
}

module.exports = validate