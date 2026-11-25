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

export const UNASSIGNED_SERIES = "Unassigned";

export const seriesIdSuffixes = {
  "Alfanta Series": "AS",
  "Alfanta Side Stories": "SIDE",
  "Eleazar Series": "ES",
  "Venganzara Series": "VS",
  "Teenage Dream Series": "TDS",
  "Casa Maria Series": "CMS",
  "Days of Yore": "DOY",
  "Wonder Trilogy": "TRI",
  "Stand Alones": "SA",
  [UNASSIGNED_SERIES]: "UN"
};

export const createProductId = (category, series, products = []) => {
  if (category !== "Books") return Date.now();

  const suffix = seriesIdSuffixes[series];
  if (!suffix) {
    throw new Error("Choose a valid series to generate a book ID.");
  }

  const idPattern = new RegExp(`^${suffix}-(\\d{2})$`);
  const highestId = products.reduce((highest, product) => {
    if (product.category !== "Books" || product.series !== series) {
      return highest;
    }

    const match = idPattern.exec(String(product.id));
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  if (highestId >= 99) {
    throw new Error(`The ${series} has reached the 99-book ID limit.`);
  }

  return `${suffix}-${String(highestId + 1).padStart(2, "0")}`;
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
