
// Reemplaza este URL por uno válido con formato CSV o JSON
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTgG7wYZXX_fake_example_output/pub?output=csv';

fetch(sheetUrl)
  .then(response => response.text())
  .then(data => {
    console.log("Datos CSV recibidos:");
    console.log(data);
    // Aquí podrías convertir CSV a JSON y graficar con Chart.js
  })
  .catch(error => {
    console.error("Error al obtener datos:", error);
  });
