const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn3j2bAUHpskd8FdsxD3X5q4oI3457IzFaYJF9Ubtn07M7TzgAFrALfHPuZ8zNgA/pub?gid=73486426&single=true&output=csv';
let datos = [];

// Función para inicializar
window.onload = function () {
  Papa.parse(csvUrl, {
    download: true,
    header: true,
    complete: function (results) {
      datos = results.data;
      cargarFiltros();
      actualizarDashboard();
    }
  });
};

function cargarFiltros() {
  const campos = ['Año', 'Mes', 'País', 'Empresa', 'Cliente', 'Ejecutiva'];
  campos.forEach(campo => {
    const valores = [...new Set(datos.map(d => d[campo]).filter(Boolean))].sort();
    const select = document.getElementById(campo.toLowerCase());
    if (select) {
      valores.forEach(v => {
        const option = document.createElement('option');
        option.value = v;
        option.textContent = v;
        select.appendChild(option);
      });
      select.addEventListener('change', actualizarDashboard);
    }
  });
}

function actualizarDashboard() {
  const filtros = {
    año: document.getElementById('year').value,
    mes: document.getElementById('month').value,
    país: document.getElementById('country').value,
    empresa: document.getElementById('company').value,
    cliente: document.getElementById('client').value,
    ejecutiva: document.getElementById('executive').value,
  };

  let filtrado = datos.filter(d => {
    return (!filtros.año || d['Año'] === filtros.año)
        && (!filtros.mes || d['Mes'] === filtros.mes)
        && (!filtros.país || d['País'] === filtros.país)
        && (!filtros.empresa || d['Empresa'] === filtros.empresa)
        && (!filtros.cliente || d['Cliente'] === filtros.cliente)
        && (!filtros.ejecutiva || d['Ejecutiva'] === filtros.ejecutiva);
  });

  // Calcular métricas
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
    if (!resumen[emp]) resumen[emp] = { mensajes: 0, entregas: 0, entradas: 0 };
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

