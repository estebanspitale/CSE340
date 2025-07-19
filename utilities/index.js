const invModel = require("../models/inventory-model")
const Util = {}

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
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<div class="inv-grid">'
    data.forEach(vehicle => { 
      grid += `
        <div class="inv-card">
          <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
            <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
          </a>
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
 * Wrap other function in this for 
 * General Error Handling
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

module.exports = Util