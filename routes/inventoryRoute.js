// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const { body } = require("express-validator")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory detail view
router.get("/detail/:invId", invController.buildDetailView);

// Route to inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement))

// View form for add classification
router.get("/classification/add", utilities.handleErrors(invController.buildAddClassificationView))

router.post(
  "/classification/add",
  body("classification_name")
    .trim()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name must not contain spaces or special characters.")
    .isLength({ min: 1 })
    .withMessage("Classification name cannot be empty."),
  utilities.handleErrors(invController.addClassification)
)

// Mostrar formulario
router.get("/inventory/add", utilities.handleErrors(invController.buildAddInventory))

// Procesar formulario con validación
router.post(
  "/inventory/add",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// Route to build edit inventory view by inv_id
router.get(
  "/edit/:invId",
  utilities.handleErrors(invController.buildEditInventoryView)
)

// Route to process inventory update
router.post(
  "/update",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

module.exports = router;