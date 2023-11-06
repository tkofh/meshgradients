export const printFloat = (float: number) =>
  Math.round(float) === float ? `${float}.0` : String(float)
