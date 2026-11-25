export { initialProducts } from "../../shared/initialProducts.js";

export const bookSeries = [
  "Alfanta Series",
  "Alfanta Side Stories",
  "Eleazar Series",
  "Venganzara Series",
  "Teenage Dream Series",
  "Casa Maria Series",
  "Days of Yore",
  "Wonder Trilogy",
  "Stand Alones"
];

export const seriesIdSuffixes = {
  "Alfanta Series": "AS",
  "Alfanta Side Stories": "SIDE",
  "Eleazar Series": "ES",
  "Venganzara Series": "VS",
  "Teenage Dream Series": "TDS",
  "Casa Maria Series": "CMS",
  "Days of Yore": "DOY",
  "Wonder Trilogy": "TRI",
  "Stand Alones": "SA"
};

export const UNASSIGNED_SERIES = "Unassigned";

export const createProductId = (category, series) => {
  const id = Date.now();
  const suffix = category === "Books" ? seriesIdSuffixes[series] : null;

  return suffix ? `${suffix}-${id}` : id;
};

export const getProductIdLabel = (product) => {
  const suffix = seriesIdSuffixes[product.series];
  const id = String(product.id);
  const alreadyHasSeriesCode = Object.values(seriesIdSuffixes).some(
    (code) => id.startsWith(`${code}-`)
  );

  if (
    product.category !== "Books" ||
    !suffix ||
    alreadyHasSeriesCode
  ) {
    return id;
  }

  return `${suffix}-${id}`;
};
