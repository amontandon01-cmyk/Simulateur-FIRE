import { clamp, getInt, getNum, uuid, defaultSegments } from "./state.js";
import { simulate } from "./sim.js";
import { ensureChart, updateChart } from "./chart.js";
import {
  computeMinMaxYears,
  renderSegments,
  updateFillForSegment,
} from "./ui.js";

const $ = (id) => document.getElementById(id);

// Throttle "par frame" (plus fluide qu’un debounce sous drag)
let rafPending = false;
function scheduleRun() {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    rafPending = false;
    run();
  });
}

function readParams() {
  const startYear = clamp(getInt($("startYear")), 1900, 2200);
  const endYear = clamp(getInt($("endYear")), 1900, 2200);

  return {
    startYear,
    endYear,
    rate: getNum($("rate")) / 100,
    initial: getNum($("initial")),
    wr: getNum($("wr")) / 100,
    wrStart: getInt($("wrStart")),
    wrMode: $("wrMode").value,
  };
}

let segments = defaultSegments();

const run = () => {
  const params = readParams();

  const result = simulate({
    ...params,
    segments,
  });

  const pivotYear = new Date().getFullYear(); // passé<=pivot vert, futur>pivot bleu

  const chart = ensureChart($("chart"));
  updateChart(chart, result, pivotYear);

  $("summary").textContent =
    `Capital en ${result.eY} : ${result.finalCHF.toFixed(0)} CHF • ` +
    `Retrait annuel (dernière année) : ${result.lastWithdrawalCHF.toFixed(0)} CHF ` +
    `(~${(result.lastWithdrawalCHF / 12).toFixed(0)} /mois)`;
};

function mountSegmentsUI() {
  const wrapEl = $("segments");

  const render = () => {
    const params = readParams();
    const { minY, maxY } = computeMinMaxYears(params.startYear, params.endYear);

    renderSegments({
      wrapEl,
      segments,
      minY,
      maxY,

      onDelete: (id) => {
        segments = segments.filter((s) => s.id !== id);
        render();
        scheduleRun();
      },

      // LIVE drag : update labels + fill seulement
      onRangeInput: (r) => {
        const id = r.dataset.id;
        const kind = r.dataset.range;
        const seg = segments.find((x) => x.id === id);
        if (!seg) return;

        const v = parseInt(r.value, 10);
        if (kind === "from") seg.from = v;
        if (kind === "to") seg.to = v;

        if (seg.from > seg.to) [seg.from, seg.to] = [seg.to, seg.from];

        $("fromLabel-" + id).textContent = seg.from;
        $("toLabel-" + id).textContent = seg.to;

        updateFillForSegment(segments, id, minY, maxY);
        // PAS de scheduleRun ici
      },

      // FIN drag : seulement maintenant on simule + redraw chart
      onRangeChange: () => {
        scheduleRun();
      },

      onFieldInput: (inp) => {
        const id = inp.dataset.id;
        const field = inp.dataset.field;
        const seg = segments.find((x) => x.id === id);
        if (!seg) return;

        seg[field] = parseFloat(inp.value) || 0;
        scheduleRun();
      },
    });
  };

  // add segment
  $("addSegment").addEventListener("click", () => {
    const params = readParams();
    const { minY, maxY } = computeMinMaxYears(params.startYear, params.endYear);
    const last = segments.at(-1) ?? null;

    segments.push({
      id: uuid(),
      from: minY,
      to: maxY,
      monthly: last ? (parseFloat(last.monthly) || 0) : 0,
      annual: last ? (parseFloat(last.annual) || 0) : 0,
    });

    render();
    scheduleRun();
  });

  // Year bounds: re-render sliders + run sim
  ["startYear", "endYear"].forEach((id) => {
    $(id).addEventListener("input", () => {
      render();
      scheduleRun();
    });
    $(id).addEventListener("change", () => {
      render();
      scheduleRun();
    });
  });

  // Other inputs: just schedule run
  ["rate", "wrMode", "wr", "wrStart", "initial"].forEach((id) => {
    $(id).addEventListener("input", scheduleRun);
    $(id).addEventListener("change", scheduleRun);
  });

  render();
}

// Init
mountSegmentsUI();
run();
