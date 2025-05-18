const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn3j2bAUHpskd8FdsxD3X5q4oI3457IzFaYJF9Ubtn07M7TzgAFrALfHPuZ8zNgA/pub?gid=73486426&single=true&output=csv';

fetch(sheetUrl)
  .then(response => response.text())
  .then(csvData => {
    const rows = csvData.split('\\n').map(row => row.split(','));
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      let obj = {};
      row.forEach((val, idx) => {
        obj[headers[idx]] = val;
      });
      return obj;
    });

    // Aquí puedes utilizar la variable 'data' para generar tus gráficas y tarjetas
    console.log(data);
  })
  .catch(error => {
    console.error('Error al obtener los datos:', error);
  });
