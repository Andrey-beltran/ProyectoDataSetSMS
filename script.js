const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn3j2bAUHpskd8FdsxD3X5q4oI3457IzFaYJF9Ubtn07M7TzgAFrALfHPuZ8zNgA/pub?gid=73486426&single=true&output=csv';

fetch(sheetUrl)
  .then(response => response.text())
  .then(csvData => {
    const rows = csvData.split('\n').map(row => row.split(','));
    const headers = rows[0].map(h => h.trim());
    const data = rows.slice(1).map(row => {
      let obj = {};
      row.forEach((val, idx) => {
        obj[headers[idx]] = val.trim();
      });
      return obj;
    });

    console.log("📊 Datos reales desde Google Sheets:");
    console.log(data);

    // Aquí es donde luego haremos tarjetas y gráficas
  })
  .catch(error => {
    console.error("❌ Error al obtener datos:", error);
  });
