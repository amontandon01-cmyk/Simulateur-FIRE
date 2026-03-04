export function simulate({
  startYear,
  endYear,
  rate,
  initial,
  wr,
  wrStart,
  wrMode,
  segments
}) {
  const sY = Math.min(startYear, endYear);
  const eY = Math.max(startYear, endYear);

  const monthlyRate = rate / 12;
  let vt = initial;

  // règle : dernier segment gagne
  const getRuleForYear = (year) => {
    for (let i = segments.length - 1; i >= 0; i--) {
      const s = segments[i];
      if (year >= s.from && year <= s.to) return s;
    }
    return null;
  };

  const monthlyForYear = (year) => (getRuleForYear(year)?.monthly ?? 0) * 1;
  const annualForYear  = (year) => (getRuleForYear(year)?.annual ?? 0) * 1;

  // percentBase : calc du capital à wrStart pour figer le retrait
  let vtWrBase = null;
  if (wrMode === 'percentBase' && wrStart >= sY && wrStart <= eY) {
    let tmp = initial;
    for (let y = sY; y <= eY; y++) {
      const mContr = monthlyForYear(y);
      for (let m = 0; m < 12; m++) tmp = tmp * (1 + monthlyRate) + mContr;
      tmp += annualForYear(y);
      if (y === wrStart) { vtWrBase = tmp; break; }
    }
  }
  const annualWithdrawalBase = (vtWrBase != null) ? vtWrBase * wr : null;

  const years = [];
  const vals = [];
  const withdrawals = [];

  for (let y = sY; y <= eY; y++) {
    const mContr = monthlyForYear(y);
    for (let m = 0; m < 12; m++) vt = vt * (1 + monthlyRate) + mContr;
    vt += annualForYear(y);

    let w = 0;
    if (wrStart >= sY && wrStart <= eY && y >= wrStart) {
      w = (wrMode === 'percentBase' && annualWithdrawalBase != null)
        ? annualWithdrawalBase
        : vt * wr;
      vt -= w;
    }

    years.push(y);
    vals.push(vt);
    withdrawals.push(w);
  }

  const final = vals.at(-1) ?? 0;
  const lastW = withdrawals.at(-1) ?? 0;

  return {
    sY, eY,
    years,
    capitalCHF: vals,
    withdrawalsCHF: withdrawals,
    finalCHF: final,
    lastWithdrawalCHF: lastW,
  };
}
