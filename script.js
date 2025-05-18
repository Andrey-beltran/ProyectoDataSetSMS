const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn3j2bAUHpskd8FdsxD3X5q4oI3457IzFaYJF9Ubtn07M7TzgAFrALfHPuZ8zNgA/pub?gid=73486426&single=true&output=csv';

fetch(sheetUrl)
  .then(response => response.text())
  .then(csvData => {
    const rows = csvData.split('\n').map(row => row.split(','));

    // Limpiar encabezados
    const headers = rows[0].map(h => h.trim().replace(/["']/g, ''));
    const data = rows.slice(1).map(row => {
      let obj = {};
      row.forEach((val, idx) => {
        obj[headers[idx]] = val.trim();
      });
      return obj;
    });

    console.log("✅ Datos cargados:", data);

    // Función para limpiar y convertir números
    const parseMoney = str => parseFloat(str.replace(/[^0-9.]/g, '')) || 0;

    // Calcular totales por canal
    let totalMovistar = 0, totalClaro = 0, totalCNT = 0, totalGeneral = 0;

    data.forEach(row => {
      totalMovistar += parseMoney(row["Movistar ($)"]);
      totalClaro += parseMoney(row["Claro ($)"]);
      totalCNT += parseMoney(row["CNT ($)"]);
      totalGeneral += parseMoney(row["Total ($)"]);
    });

    // Mostrar tarjeta resumen
    document.getElementById("summary-cards").innerHTML = `
      <div class="card">
        <h2>Total facturado</h2>
        <p><strong>$${totalGeneral.toLocaleString("es-CO")}</strong></p>
      </div>
    `;

    // Mostrar gráfica
    const ctx = document.getElementById('trafficChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Movistar', 'Claro', 'CNT', 'Total'],
        datasets: [{
          label: 'USD por canal',
          data: [totalMovistar, totalClaro, totalCNT, totalGeneral],
          backgroundColor: ['#0070c0', '#ed1c24', '#ffc000', '#2e8b57']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: context => `$${context.parsed.y.toLocaleString("es-CO")}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: value => `$${value.toLocaleString("es-CO")}`
            }
          }
        }
      }
    });
  })
  .catch(error => {
    console.error("❌ Error al cargar datos:", error);
  });

