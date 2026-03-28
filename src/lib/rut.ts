const clean = (value: string) => value.replace(/[^0-9kK]/g, "").toUpperCase();

export function normalizeRut(value: string) {
  return clean(value);
}

export function validateRut(value: string) {
  const rut = clean(value);
  if (rut.length < 2) return false;

  const body = rut.slice(0, -1);
  const dv = rut.slice(-1);
  let sum = 0;
  let multiplier = 2;

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expected = 11 - (sum % 11);
  const expectedDv = expected === 11 ? "0" : expected === 10 ? "K" : String(expected);
  return expectedDv === dv;
}

export function formatRut(value: string) {
  const rut = clean(value);
  if (rut.length < 2) return rut;
  const body = rut.slice(0, -1);
  const dv = rut.slice(-1);
  return `${body}-${dv}`;
}
