const pool = require("../database/");

/** Nueva reseña */
async function addReview(invId, accountId, reviewText, reviewRating) {
  const sql = `
    INSERT INTO reviews (inv_id, account_id, review_text, review_rating)
    VALUES ($1, $2, $3, $4)
  `;
  return pool.query(sql, [invId, accountId, reviewText, reviewRating]);
}

/** Reseñas de un vehículo */
async function getReviewsByInvId(invId) {
  const sql = `
    SELECT r.review_text, r.review_rating, r.review_date,
           a.account_firstname, a.account_lastname
    FROM reviews r
    JOIN account a ON r.account_id = a.account_id
    WHERE r.inv_id = $1
    ORDER BY r.review_date DESC
  `;
  const result = await pool.query(sql, [invId]);
  return result.rows;
}

module.exports = { addReview, getReviewsByInvId };
