const reviewModel = require("../models/review-model");
const utilities = require("../utilities/");

async function addReview(req, res) {
  const { inv_id, review_text, review_rating } = req.body;
  const account_id = res.locals.accountData.account_id;

  try {
    await reviewModel.addReview(inv_id, account_id, review_text, review_rating);
    req.flash("notice", "¡Gracias por tu reseña!");
  } catch (error) {
    console.error("Error al agregar reseña:", error);
    req.flash("error", "No se pudo guardar tu reseña. Inténtalo de nuevo.");
  }

  res.redirect(`/inv/detail/${inv_id}`);
}

module.exports = { addReview };
