const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn3j2bAUHpskd8FdsxD3X5q4oI3457IzFaYJF9Ubtn07M7TzgAFrALfHPuZ8zNgA/pub?gid=73486426&single=true&output=csv';
let datos = [];

// Mapeo entre ID de los selects y columnas del CSV
const filtrosMap = {
  year: 'Año',
  month: 'Mes',
  country: 'País',
  company: 'Empresa',
  client: 'Cliente',
  executive: 'Ejecutiva'
};

window.onload = function () {
  Papa.parse(csvUrl, {
    download: true,
    header: true,
    complete: function (results) {
      datos = results.data;
      cargarFiltros();
      actualizarDashboard();
      renderResumenServicios();
    }
  });
};

function cargarFiltros() {
  for (const [id, columna] of Object.entries(filtrosMap)) {
    const valores = [...new Set(datos.map(d => d[columna]).filter(Boolean))].sort();
    const select = document.getElementById(id);
    if (select) {
      valores.forEach(v => {
        const option = document.createElement('option');
        option.value = v;
        option.textContent = v;
        select.appendChild(option);
      });
      select.addEventListener('change', () => {
        actualizarDashboard();
        renderResumenServicios();
      });
    }
  }
}

function actualizarDashboard() {
  let filtrado = datos.filter(d => {
    return Object.entries(filtrosMap).every(([id, columna]) => {
      const valor = document.getElementById(id).value;
      return !valor || d[columna] === valor;
    });
  });

  let totalMensajes = filtrado.reduce((acc, d) => acc + parseFloat(d['Total Trafico SMS'] || 0), 0);
  let ingresos = filtrado.reduce((acc, d) => acc + parseFloat(d['Total ($)'] || 0), 0);
  let tasaProm = filtrado.length > 0 ? (filtrado.reduce((acc, d) => {
    let suma = 0;
    ['Movistar ($)', 'Claro ($)', 'CNT ($)'].forEach(k => suma += parseFloat(d[k] || 0));
    return acc + (suma > 0 ? parseFloat(d['Total Trafico SMS'] || 0) / suma : 0);
  }, 0) / filtrado.length) : 0;

  document.getElementById('totalMensajes').textContent = totalMensajes.toLocaleString();
  document.getElementById('ingresos').textContent = `$${ingresos.toFixed(2)}`;
  document.getElementById('tasaEntrega').textContent = `${(tasaProm * 100).toFixed(1)}%`;
  document.getElementById('canalesActivos').textContent = new Set(filtrado.map(d => d['Servicio'])).size;

  dibujarGrafica(filtrado);
  renderEmpresas(filtrado);
}

function dibujarGrafica(filtrado) {
  let ctx = document.getElementById('chartEmpresa').getContext('2d');
  if (window.chart) window.chart.destroy();

  let empresas = [...new Set(filtrado.map(d => d['Empresa']))];
  let meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  let datasets = empresas.map(empresa => {
    let data = meses.map(m => {
      let total = filtrado.filter(d => d['Mes'] === m && d['Empresa'] === empresa)
        .reduce((acc, d) => acc + parseFloat(d['Total Trafico SMS'] || 0), 0);
      return total;
    });
    return {
      label: empresa,
      data: data,
      fill: true,
      tension: 0.4
    };
  });

  window.chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: meses,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function renderEmpresas(filtrado) {
  let container = document.getElementById('companyCards');
  container.innerHTML = '';

  let resumen = {};
  filtrado.forEach(d => {
    let emp = d['Empresa'];
    if (!resumen[emp]) resumen[emp] = { mensajes: 0 };
    resumen[emp].mensajes += parseFloat(d['Total Trafico SMS'] || 0);
  });

  Object.entries(resumen).sort((a,b) => b[1].mensajes - a[1].mensajes).slice(0, 5).forEach(([empresa, data]) => {
    let div = document.createElement('div');
    div.className = 'col-md-4';
    div.innerHTML = `
      <div class="company-card">
        <h5>${empresa}</h5>
        <p><strong>${data.mensajes.toLocaleString()}</strong> mensajes</p>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderResumenServicios() {
  let filtrado = datos.filter(d => {
    return Object.entries(filtrosMap).every(([id, columna]) => {
      const valor = document.getElementById(id).value;
      return !valor || d[columna] === valor;
    });
  });

  const resumenServicios = {};

  filtrado.forEach(d => {
    const servicio = d['Servicio'] || 'No definido';
    const ingreso = parseFloat(d['Total ($)'] || 0);
    const costo = ['Movistar ($)', 'Claro ($)', 'CNT ($)']
      .reduce((acc, k) => acc + parseFloat(d[k] || 0), 0);
    if (!resumenServicios[servicio]) resumenServicios[servicio] = { ingreso: 0, costo: 0 };
    resumenServicios[servicio].ingreso += ingreso;
    resumenServicios[servicio].costo += costo;
  });

  const tabla = document.getElementById('resumenServicios');
  if (!tabla) return;

  tabla.innerHTML = `
    <table class="table table-bordered table-sm table-hover mt-4">
      <thead class="table-light">
        <tr>
          <th>Servicio</th>
          <th>Ingresos</th>
          <th>Costos</th>
          <th>Utilidad</th>
          <th>% Rentabilidad</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(resumenServicios).map(([servicio, { ingreso, costo }]) => {
          const utilidad = ingreso - costo;
          const rentabilidad = ingreso > 0 ? (utilidad / ingreso) * 100 : 0;
          return `
            <tr>
              <td>${servicio}</td>
              <td>$${ingreso.toFixed(2)}</td>
              <td>$${costo.toFixed(2)}</td>
              <td>$${utilidad.toFixed(2)}</td>
              <td>${rentabilidad.toFixed(2)}%</td>
            </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

