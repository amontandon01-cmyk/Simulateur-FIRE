let chart = null;

export function ensureChart(canvasEl) {
  if (chart) return chart;

  const ctx = canvasEl.getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        // 0) Capital passé (vert)
        {
          label: "Capital (passé, kCHF)",
          data: [],
          borderColor: "rgba(34,197,94,1)",       // vert
          backgroundColor: "rgba(34,197,94,0.08)",
          tension: 0.22,
          fill: true,
          pointRadius: 0,
        },
        // 1) Capital futur (bleu)
        {
          label: "Capital (futur, kCHF)",
          data: [],
          borderColor: "rgba(59,130,246,1)",       // bleu
          backgroundColor: "rgba(59,130,246,0.08)",
          tension: 0.22,
          fill: true,
          pointRadius: 0,
        },
        // 2) Retrait annuel (gris)
        {
          label: "Retrait annuel (kCHF)",
          data: [],
          borderColor: "rgba(148, 163, 184, 0.95)",
          borderDash: [6, 4],
          tension: 0.15,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      // Perf : désactive animations (rend l’update plus “snappy”)
      animation: { duration: 0 },
      hover: { animationDuration: 0 },
      responsiveAnimationDuration: 0,

      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: "#e5e7eb", font: { size: 11 } } },
        tooltip: {
          backgroundColor: "rgba(2,6,23,0.85)",
          borderColor: "rgba(148,163,184,0.25)",
          borderWidth: 1,
          titleColor: "#e5e7eb",
          bodyColor: "#e5e7eb",
        },
      },
      scales: {
        y: {
          title: { display: true, text: "kCHF", color: "#9ca3af" },
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(55,65,81,0.35)" },
        },
        x: {
          title: { display: true, text: "Année", color: "#9ca3af" },
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(31,41,55,0.45)" },
        },
      },
    },
  });

  return chart;
}

/**
 * Met à jour le chart en séparant passé/futur selon pivotYear.
 * - pivotYear inclus dans "passé"
 */
export function updateChart(chart, { years, capitalCHF, withdrawalsCHF }, pivotYear) {
  chart.data.labels = years;

  const past = years.map((y, i) => (y <= pivotYear ? capitalCHF[i] / 1000 : null));
  const future = years.map((y, i) => (y > pivotYear ? capitalCHF[i] / 1000 : null));
  const w = withdrawalsCHF.map(v => v / 1000);

  chart.data.datasets[0].data = past;
  chart.data.datasets[1].data = future;
  chart.data.datasets[2].data = w;

  // Perf : update sans animation
  chart.update("none"); // 'none' skip animations [1](https://www.chartjs.org/docs/latest/developers/api.html)[2](https://github.com/chartjs/Chart.js/issues/10390)
}
