'use strict'

// Seleccionamos el select con id classificationList
let classificationList = document.querySelector("#classificationList")

// Esperamos a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Evento 'change' (cuando cambia la opción seleccionada)
  classificationList.addEventListener("change", function () {
    let classification_id = classificationList.value
    console.log(`classification_id is: ${classification_id}`)

    // URL para hacer la petición fetch
    let classIdURL = "/inv/getInventory/" + classification_id

    fetch(classIdURL)
      .then(function (response) {
        if (response.ok) {
          return response.json()
        }
        throw Error("Network response was not OK")
      })
      .then(function (data) {
        if (!Array.isArray(data) || data.length === 0) {
          document.getElementById("inventoryDisplay").innerHTML =
            "<p>No vehicles found.</p>"
          return
        }
        buildInventoryList(data)
      })
      .catch(function (error) {
        console.error('There was a problem: ', error.message)
        document.getElementById("inventoryDisplay").innerHTML =
          "<p>Error loading data.</p>"
      })
  })
})

// Construye la tabla HTML con los datos
function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay")

  // Set up the table labels
  let dataTable = '<thead>'
  dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'
  dataTable += '</thead>'

  // Set up the table body
  dataTable += '<tbody>'

  // Iterar sobre todos los vehículos
  data.forEach(function (element) {
    console.log(element.inv_id + ", " + element.inv_model)
    dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`
    dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`
    dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`
  })

  dataTable += '</tbody>'

  // Mostrar contenido en el DOM
  inventoryDisplay.innerHTML = dataTable
}
