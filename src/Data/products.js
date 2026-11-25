import as1Image from "./product_images/as1.png";

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

  if (product.category !== "Books" || !suffix || id.startsWith(`${suffix}-`)) {
    return id;
  }

  return `${suffix}-${id}`;
};

export const initialProducts = [
  {
    id: "AS-01",
    name: "Tears by the Moonlight",
    category: "Books",
    series: "Alfanta Series",
    price: 800,
    stock: 100,
    image: as1Image
  },
  {
    id: "AS-02",
    name: "Tangled under the Stars",
    category: "Books",
    series: "Alfanta Series",
    price: 800,
    stock: 100,
    image: as2Image
  },
  {
    id: "AS-03",
    name: "Taking over the Storm",
    category: "Books",
    series: "Alfanta Series",
    price: 800,
    stock: 100,
    image: as3Image
  },
  {
    id: "AS-04",
    name: "Touches of Cold Love",
    category: "Books",
    series: "Alfanta Series",
    price: 800,
    stock: 100,
    image: as4Image
  },
  {
    id: "AS-05",
    name: "Thorns within the Shadow",
    category: "Books",
    series: "Alfanta Series",
    price: 800,
    stock: 100,
    image: as5Image
  },
  {
    id: "AS-06",
    name: "Tilted Rays of Sunshine",
    category: "Books",
    series: "Alfanta Series",
    price: 800,
    stock: 100,
    image: as6Image
  },
  {
    id: "AS-07",
    name: "Trails of Wilted Flowers",
    category: "Books",
    series: "Alfanta Series",
    price: 800,
    stock: 100,
    image: as7Image
  },
  {
    id: "AS-08",
    name: "Tomorrow beneath the Clouds",
    category: "Books",
    series: "Alfanta Series",
    price: 800,
    stock: 100,
    image: as8Image
  },
  
];