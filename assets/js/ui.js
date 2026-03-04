import { clamp } from './state.js';

export function computeMinMaxYears(startYear, endYear) {
  const minY = Math.min(startYear, endYear);
  const maxY = Math.max(startYear, endYear);
  return { minY, maxY };
}

export function updateFillForSegment(segments, id, minY, maxY) {
  const seg = segments.find(s => s.id === id);
  const fill = document.getElementById(`fill-${id}`);
  if (!seg || !fill) return;

  const span = Math.max(1, maxY - minY);
  const left = ((seg.from - minY) / span) * 100;
  const right = 100 - ((seg.to - minY) / span) * 100;

  fill.style.left = `${clamp(left, 0, 100)}%`;
  fill.style.right = `${clamp(right, 0, 100)}%`;
}

export function renderSegments({
  wrapEl,
  segments,
  minY,
  maxY,
  onDelete,
  onRangeInput,
  onFieldInput
}) {
  wrapEl.innerHTML = '';

  segments.forEach((s, idx) => {
    const el = document.createElement('div');
    el.className = 'segment';

    el.innerHTML = `
      <div class="segTop">
        <div class="segTitle">Segment ${idx + 1} <em>(${s.from} → ${s.to})</em></div>
        <button class="iconBtn" type="button" data-del="${s.id}">Supprimer</button>
      </div>

      <div class="rangeBox">
        <div class="rangeLabels">
          <span>De : <strong id="fromLabel-${s.id}">${s.from}</strong></span>
          <span>À : <strong id="toLabel-${s.id}">${s.to}</strong></span>
        </div>

        <div class="dual">
          <div class="track"><div class="fill" id="fill-${s.id}"></div></div>
          <input type="range" min="${minY}" max="${maxY}" value="${s.from}" step="1" data-range="from" data-id="${s.id}">
          <input type="range" min="${minY}" max="${maxY}" value="${s.to}"   step="1" data-range="to"   data-id="${s.id}">
        </div>
      </div>

      <div class="grid2" style="margin-top:8px;">
        <label>Mensuel (CHF)
          <input type="number" step="50" value="${s.monthly}" data-field="monthly" data-id="${s.id}">
        </label>
        <label>Annuel (CHF)
          <input type="number" step="100" value="${s.annual}" data-field="annual" data-id="${s.id}">
        </label>
      </div>
    `;

    wrapEl.appendChild(el);
    updateFillForSegment(segments, s.id, minY, maxY);
  });

  // delete
  wrapEl.querySelectorAll('button[data-del]').forEach(btn => {
    btn.addEventListener('click', () => onDelete(btn.dataset.del));
  });

  // range
  wrapEl.querySelectorAll('input[type="range"]').forEach(r => {
    r.addEventListener('input', () => onRangeInput(r));
  });

  // number fields
  wrapEl.querySelectorAll('input[type="number"][data-field]').forEach(inp => {
    inp.addEventListener('input', () => onFieldInput(inp));
  });
}
