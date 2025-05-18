const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn3j2bAUHpskd8FdsxD3X5q4oI3457IzFaYJF9Ubtn07M7TzgAFrALfHPuZ8zNgA/pub?gid=73486426&single=true&output=csv';

fetch(sheetUrl)
  .then(response => response.text())
  .then(csvData => {
    const rows = csvData.split('\n').map(row => row.split(','));

    // Limpiar encabezados
    const headers = rows[0].map(header => header.trim().replace(/["']/g, ''));
    const data = rows.slice(1).map(row => {
      let obj = {};
      row.forEach((val, idx) => {
        obj[headers[idx]] = val.trim();
      });
      return obj;
    });

    console.log("✅ Datos reales cargados:");
    console.table(data);

    // Ejemplo: totalizar el valor de la columna "Total ($)"
    const total = data.reduce((sum, row) => {
      const valor = parseFloat(row["Total ($)"].replace(/[^0-9.]/g, '')) || 0;
      return sum + valor;
    }, 0);

    // Mostrar en la web como tarjeta simple
    const container = document.getElementById("summary-cards");
    container.innerHTML = `
      <div class="card">
        <h2>Total facturado</h2>
        <p><strong>$${total.toLocaleString("es-CO")}</strong></p>
      </div>
    `;
  })
  .catch(error => {
    console.error("❌ Error al cargar datos:", error);
  });
