let chart = null;

export function ensureChart(canvasEl) {
  if (chart) return chart;

  const ctx = canvasEl.getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Capital (kCHF)',
          data: [],
          borderColor: 'rgba(34, 211, 238, 1)',
          backgroundColor: 'rgba(34, 211, 238, 0.08)',
          tension: 0.22,
          fill: true,
          pointRadius: 0
        },
        {
          label: 'Retrait annuel (kCHF)',
          data: [],
          borderColor: 'rgba(148, 163, 184, 0.95)',
          borderDash: [6, 4],
          tension: 0.15,
          pointRadius: 0,
          fill: false
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#e5e7eb', font: { size: 11 } } },
        tooltip: {
          backgroundColor: 'rgba(2,6,23,0.85)',
          borderColor: 'rgba(148,163,184,0.25)',
          borderWidth: 1,
          titleColor: '#e5e7eb',
          bodyColor: '#e5e7eb'
        }
      },
      scales: {
        y: {
          title: { display: true, text: 'kCHF', color: '#9ca3af' },
          ticks: { color: '#9ca3af' },
          grid: { color: 'rgba(55,65,81,0.35)' }
        },
        x: {
          title: { display: true, text: 'Année', color: '#9ca3af' },
          ticks: { color: '#9ca3af' },
          grid: { color: 'rgba(31,41,55,0.45)' }
        }
      }
    }
  });

  return chart;
}

export function updateChart(chart, { years, capitalCHF, withdrawalsCHF }) {
  chart.data.labels = years;
  chart.data.datasets[0].data = capitalCHF.map(v => v / 1000);
  chart.data.datasets[1].data = withdrawalsCHF.map(v => v / 1000);
  chart.update();
}
