import data from "../data/registry.json";

export const categories = data.categories;
export const items = data.items;
export const itemsById = Object.fromEntries(items.map((i) => [i.id, i]));
