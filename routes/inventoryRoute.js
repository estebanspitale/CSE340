const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const { body } = require("express-validator")
const invValidate = require("../utilities/inventory-validation")

// Rutas públicas (sin protección)
router.get("/type/:classificationId", invController.buildByClassificationId)
router.get("/detail/:invId", invController.buildDetailView)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Rutas administrativas (protegidas con checkJWTToken y checkAccountType)
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagement)
)

router.get(
  "/classification/add",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassificationView)
)

router.post(
  "/classification/add",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  body("classification_name")
    .trim()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name must not contain spaces or special characters.")
    .isLength({ min: 1 })
    .withMessage("Classification name cannot be empty."),
  utilities.handleErrors(invController.addClassification)
)

router.get(
  "/inventory/add",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  "/inventory/add",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

router.get(
  "/edit/:invId",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildEditInventoryView)
)

router.post(
  "/update",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

router.get(
  "/delete/:invId",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildDeleteView)
)

router.post(
  "/delete",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteInventoryItem)
)

module.exports = router
