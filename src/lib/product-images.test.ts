import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getImagesForColor, isColorMatch } from "./product-images.ts";
import type { Product } from "../types/index.ts";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    slug: "boss-polo",
    name: "Boss Polo",
    description: "",
    price: 1200,
    category: "polos",
    images: [
      "https://cdn.example.com/jet-black-1.jpg",
      "https://cdn.example.com/jet-black-2.jpg",
      "https://cdn.example.com/dark-green-1.jpg",
      "https://cdn.example.com/dark-green-2.jpg",
      "https://cdn.example.com/general-1.jpg",
    ],
    productImages: [
      { url: "https://cdn.example.com/jet-black-1.jpg", colorName: "Jet Black", colorCode: "#111111", sortOrder: 0 },
      { url: "https://cdn.example.com/jet-black-2.jpg", colorName: "Jet Black", colorCode: "#111111", sortOrder: 1 },
      { url: "https://cdn.example.com/dark-green-1.jpg", colorName: "Dark Green", colorCode: "#14532d", sortOrder: 2 },
      { url: "https://cdn.example.com/dark-green-2.jpg", colorName: "Dark Green", colorCode: "#14532d", sortOrder: 3 },
      { url: "https://cdn.example.com/general-1.jpg", colorName: "General", colorCode: null, sortOrder: 4 },
    ],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Jet Black", hex: "#111111" },
      { name: "Dark Green", hex: "#14532d" },
    ],
    stock: 10,
    inStock: true,
    generalImagePosition: "LAST",
    ...overrides,
  };
}

describe("isColorMatch", () => {
  it("does not match Jet Black with Dark Green", () => {
    assert.equal(isColorMatch("Dark Green", "#14532d", "Jet Black", "#111111"), false);
    assert.equal(isColorMatch("Jet Black", "#111111", "Dark Green", "#14532d"), false);
  });

  it("does not match Black with Jet Black when hexes differ", () => {
    assert.equal(isColorMatch("Black", "#000000", "Jet Black", "#111111"), false);
    assert.equal(isColorMatch("Jet Black", "#111111", "Black", "#000000"), false);
  });

  it("matches exact normalized names or exact hexes", () => {
    assert.equal(isColorMatch("Jet Black", "#222222", "jet black", "#111111"), true);
    assert.equal(isColorMatch("Charcoal", "#111111", "Jet Black", "#111111"), true);
  });
});

describe("getImagesForColor", () => {
  it("returns only Jet Black + General images for Jet Black", () => {
    const product = makeProduct();
    assert.deepEqual(getImagesForColor(product, "Jet Black"), [
      "https://cdn.example.com/jet-black-1.jpg",
      "https://cdn.example.com/jet-black-2.jpg",
      "https://cdn.example.com/general-1.jpg",
    ]);
  });

  it("returns only Dark Green + General images for Dark Green", () => {
    const product = makeProduct();
    assert.deepEqual(getImagesForColor(product, "Dark Green"), [
      "https://cdn.example.com/dark-green-1.jpg",
      "https://cdn.example.com/dark-green-2.jpg",
      "https://cdn.example.com/general-1.jpg",
    ]);
  });

  it("places General images FIRST when generalImagePosition is FIRST", () => {
    const product = makeProduct({ generalImagePosition: "FIRST" });
    assert.deepEqual(getImagesForColor(product, "Jet Black"), [
      "https://cdn.example.com/general-1.jpg",
      "https://cdn.example.com/jet-black-1.jpg",
      "https://cdn.example.com/jet-black-2.jpg",
    ]);
  });

  it("places General images LAST when generalImagePosition is LAST", () => {
    const product = makeProduct({ generalImagePosition: "LAST" });
    assert.deepEqual(getImagesForColor(product, "Dark Green"), [
      "https://cdn.example.com/dark-green-1.jpg",
      "https://cdn.example.com/dark-green-2.jpg",
      "https://cdn.example.com/general-1.jpg",
    ]);
  });

  it("returns only general images for a color with no tagged images when other images are tagged", () => {
    const product = makeProduct({
      colors: [
        { name: "Jet Black", hex: "#111111" },
        { name: "Dark Green", hex: "#14532d" },
        { name: "Beige", hex: "#d4b896" },
      ],
    });
    assert.deepEqual(getImagesForColor(product, "Beige"), [
      "https://cdn.example.com/general-1.jpg",
    ]);
  });

  it("returns full gallery for a missing color when no general images exist", () => {
    const product = makeProduct({
      images: [
        "https://cdn.example.com/jet-black-1.jpg",
        "https://cdn.example.com/dark-green-1.jpg",
      ],
      productImages: [
        { url: "https://cdn.example.com/jet-black-1.jpg", colorName: "Jet Black", colorCode: "#111111", sortOrder: 0 },
        { url: "https://cdn.example.com/dark-green-1.jpg", colorName: "Dark Green", colorCode: "#14532d", sortOrder: 1 },
      ],
      colors: [
        { name: "Jet Black", hex: "#111111" },
        { name: "Dark Green", hex: "#14532d" },
        { name: "Beige", hex: "#d4b896" },
      ],
    });
    assert.deepEqual(getImagesForColor(product, "Beige"), [
      "https://cdn.example.com/jet-black-1.jpg",
      "https://cdn.example.com/dark-green-1.jpg",
    ]);
  });
});
