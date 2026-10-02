import type { Address, Article, Collection, Order, Review } from "@/types";

export const BRAND = {
  name: "AVELOR",
  tagline: "Designed for the everyday.",
  instagram: "@avelor",
  email: "care@avelor.in",
  phone: "+91 98204 41120",
  whatsapp: "+91 98204 41120",
  address: "Unit 4, Kamala Mills, Lower Parel, Mumbai 400013",
};

export const collections: Collection[] = [
  {
    slug: "new-arrivals",
    title: "New Arrivals",
    description:
      "The most recent additions to the wardrobe — layering pieces, refined tailoring and the everyday shapes we keep returning to.",
    image: "/images/campaign.jpg",
    productSlugs: [],
  },
  {
    slug: "essentials",
    title: "Essentials",
    description:
      "The pieces we make in every season. Tested fabrics, resolved proportions, and prices that stay honest.",
    image: "/images/journal-1.jpg",
    productSlugs: [],
  },
  {
    slug: "studio-tailoring",
    title: "Studio Tailoring",
    description: "Soft construction, long lines and dry fabrics — tailoring built for ordinary days.",
    image: "/images/editorial-1.jpg",
    productSlugs: [],
  },
  {
    slug: "denim-study",
    title: "Denim Study",
    description: "Three fits, two washes, one mill. A focused look at how we cut denim.",
    image: "/images/p-jeans-1.jpg",
    productSlugs: [],
  },
  {
    slug: "winter-atelier",
    title: "Winter Atelier",
    description: "Wool, cashmere and quilted layers made for cold mornings and long commutes.",
    image: "/images/p-coat-1.jpg",
    productSlugs: [],
  },
  {
    slug: "layering",
    title: "Layering",
    description: "Overshirts, liners and knits designed to sit under and over each other without bulk.",
    image: "/images/p-overshirt-1.jpg",
    productSlugs: [],
  },
  {
    slug: "summer-neutrals",
    title: "Summer Neutrals",
    description: "Linen, poplin and open weaves in a palette drawn from sand, chalk and stone.",
    image: "/images/look-1.jpg",
    productSlugs: [],
  },
  {
    slug: "women",
    title: "Women",
    description: "Dresses, tailoring, knitwear and denim cut for the women's fit block.",
    image: "/images/p-dress-1.jpg",
    productSlugs: [],
  },
  {
    slug: "men",
    title: "Men",
    description: "Shirting, overshirts, denim and knits cut for the men's fit block.",
    image: "/images/p-shirt-1.jpg",
    productSlugs: [],
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    productSlug: "atlas-heavyweight-tee",
    name: "Ananya Raghavan",
    city: "Bengaluru",
    rating: 5,
    title: "The weight is the whole point",
    body: "I have worn this three times a week since March and it still holds its shape. The shoulder seam sits exactly where it should.",
    date: "2026-06-18",
    verified: true,
  },
  {
    id: "r2",
    productSlug: "atlas-heavyweight-tee",
    name: "Kabir Sethi",
    city: "New Delhi",
    rating: 4,
    title: "Runs slightly relaxed",
    body: "Great fabric. I usually take L and went with M for a cleaner line — worth checking the size guide first.",
    date: "2026-05-29",
    verified: true,
  },
  {
    id: "r3",
    productSlug: "warden-twill-overshirt",
    name: "Meher Kapadia",
    city: "Mumbai",
    rating: 5,
    title: "Wears in beautifully",
    body: "The twill softened after two washes without losing structure. It has replaced my light jacket entirely.",
    date: "2026-07-04",
    verified: true,
  },
  {
    id: "r4",
    productSlug: "kiln-pleated-trouser",
    name: "Rohan Iyer",
    city: "Pune",
    rating: 5,
    title: "Tailoring that isn't stiff",
    body: "Dry hand, clean drape, and the single pleat does not balloon. I ordered a second pair in charcoal.",
    date: "2026-07-12",
    verified: true,
  },
  {
    id: "r5",
    productSlug: "ridge-merino-crew",
    name: "Simran Bedi",
    city: "Chandigarh",
    rating: 5,
    title: "No itch at all",
    body: "Fine merino that actually works in Indian winters. Layers under a coat without any bulk.",
    date: "2026-06-27",
    verified: true,
  },
  {
    id: "r6",
    productSlug: "slip-column-dress",
    name: "Tara Menon",
    city: "Kochi",
    rating: 4,
    title: "Quiet and well cut",
    body: "The crepe does not cling. Wore it to a dinner and to work the following week.",
    date: "2026-06-08",
    verified: true,
  },
];

export const testimonials = [
  {
    name: "Ishaan Malhotra",
    city: "Mumbai",
    rating: 5,
    quote:
      "I stopped buying five things a season. Three AVELOR pieces cover most of my week and still look considered.",
  },
  {
    name: "Nandita Rao",
    city: "Hyderabad",
    rating: 5,
    quote:
      "The fabric notes are honest and the fits are consistent between styles — that alone makes ordering online easy.",
  },
  {
    name: "Aditya Kulkarni",
    city: "Bengaluru",
    rating: 4,
    quote:
      "Delivery in two days, packaging with no plastic, and an exchange handled in a single message. Rare combination.",
  },
];

export const articles: Article[] = [
  {
    slug: "building-a-neutral-wardrobe",
    title: "Building a wardrobe around eight neutrals",
    category: "Guides",
    excerpt:
      "A practical method for narrowing a palette so that everything you own works with everything else.",
    author: "Rhea Sharma",
    date: "2026-07-10",
    readingTime: "6 min read",
    image: "/images/journal-1.jpg",
    body: [
      {
        paragraphs: [
          "Most wardrobes fail not because of the pieces in them but because of the distance between those pieces. A palette of eight neutrals removes that distance: every top meets every trouser, and the decision of what to wear collapses from twenty options to three.",
          "We start with a base of ecru, bone and stone, add two mid tones in clay and slate, and close with charcoal, black and indigo. Nothing here fights for attention.",
        ],
      },
      {
        heading: "Start with the trousers",
        paragraphs: [
          "Trousers set the tone for everything above them. A dry wool in stone will accept a white tee, a merino crew and an overshirt without needing thought.",
          "If you own only one pair, make it the one that reads well with both leather and rubber soles.",
        ],
        image: "/images/p-trousers-1.jpg",
      },
      {
        heading: "Let texture do the work",
        paragraphs: [
          "When colour is quiet, texture becomes the interest. Pair a smooth poplin with a brushed terry, or a matte crepe with a full-grain leather belt. The eye reads difference even when the palette holds still.",
        ],
      },
    ],
  },
  {
    slug: "how-we-choose-fabric",
    title: "How we choose a fabric",
    category: "Materials",
    excerpt: "Weight, twist, finish and shrinkage — the four tests every AVELOR fabric passes before it is cut.",
    author: "Devang Shah",
    date: "2026-06-22",
    readingTime: "5 min read",
    image: "/images/detail-fabric.jpg",
    body: [
      {
        paragraphs: [
          "A fabric can look right on a roll and behave badly on a body. We buy small lengths first and wash them eight times before anything is approved.",
        ],
      },
      {
        heading: "Weight before softness",
        paragraphs: [
          "Softness is easy to fake with finishing. Weight is not. A 240 GSM cotton will hold a shoulder long after a softened 160 GSM has collapsed.",
        ],
      },
      {
        heading: "The eight-wash rule",
        paragraphs: [
          "If a fabric moves more than three percent after eight washes, it does not go into production. It is a slow rule that removes most of the returns we would otherwise see.",
        ],
        image: "/images/story-1.jpg",
      },
    ],
  },
  {
    slug: "the-case-for-fewer-pieces",
    title: "The case for fewer, better pieces",
    category: "Stories",
    excerpt: "What happens to a wardrobe when you stop replacing and start repairing.",
    author: "Rhea Sharma",
    date: "2026-05-30",
    readingTime: "4 min read",
    image: "/images/journal-2.jpg",
    body: [
      {
        paragraphs: [
          "Buying less only works when what you buy survives. That places the burden on construction, not on restraint.",
          "We design for a five-year horizon: reinforced seams, replaceable buttons, and fabrics that improve with washing rather than degrade.",
        ],
      },
      {
        heading: "Repair as a habit",
        paragraphs: [
          "Our Mumbai studio repairs any AVELOR piece for the first two years. A resewn seam costs us very little and keeps a garment out of a landfill for years.",
        ],
      },
    ],
  },
  {
    slug: "styling-the-overshirt",
    title: "Three ways to wear an overshirt",
    category: "Style",
    excerpt: "The most useful layer in the wardrobe, styled for the office, the weekend and the evening.",
    author: "Kabir Nair",
    date: "2026-07-02",
    readingTime: "4 min read",
    image: "/images/p-overshirt-1.jpg",
    body: [
      {
        paragraphs: [
          "An overshirt earns its place because it works at three temperatures. Open over a tee in the morning, buttoned under a coat at night.",
        ],
      },
      {
        heading: "Office",
        paragraphs: ["Stone twill over a merino crew with pleated trousers and a leather belt. Nothing shiny."],
        image: "/images/look-1.jpg",
      },
      {
        heading: "Weekend",
        paragraphs: ["Same overshirt, straight jean, white tee. Roll the cuff once."],
      },
      {
        heading: "Evening",
        paragraphs: ["Charcoal on charcoal, buttoned, with the collar left soft."],
      },
    ],
  },
  {
    slug: "designing-for-indian-summers",
    title: "Designing for Indian summers",
    category: "Design",
    excerpt: "Open weaves, higher armholes and why we avoid heavy linings between March and July.",
    author: "Devang Shah",
    date: "2026-04-26",
    readingTime: "5 min read",
    image: "/images/journal-2.jpg",
    body: [
      {
        paragraphs: [
          "Designing for 38°C is a construction problem more than a fabric problem. Airflow depends on where a garment touches the body.",
        ],
      },
      {
        heading: "Raise the armhole",
        paragraphs: [
          "A higher armhole with a wider sleeve moves more air than a dropped shoulder, and keeps the shirt from sticking across the back.",
        ],
      },
    ],
  },
  {
    slug: "a-quieter-supply-chain",
    title: "A quieter supply chain",
    category: "Sustainability",
    excerpt: "Four mills, two units, and the reason we publish every one of them.",
    author: "Rhea Sharma",
    date: "2026-03-19",
    readingTime: "6 min read",
    image: "/images/story-1.jpg",
    body: [
      {
        paragraphs: [
          "We work with four mills in Tamil Nadu and Gujarat and two stitching units in Mumbai. Keeping the list short makes it possible to visit every partner twice a year.",
        ],
      },
      {
        heading: "What we measure",
        paragraphs: [
          "Water per metre, wage floor against the local living wage, and the share of deadstock reused in linings and pocket bags.",
        ],
      },
    ],
  },
];

export const JOURNAL_CATEGORIES = ["Style", "Materials", "Design", "Guides", "Stories", "Sustainability"];

export const socialImages = [
  "/images/look-1.jpg",
  "/images/editorial-1.jpg",
  "/images/journal-2.jpg",
  "/images/p-coat-1.jpg",
  "/images/campaign.jpg",
  "/images/p-knit-1.jpg",
  "/images/detail-fabric.jpg",
  "/images/p-accessory-1.jpg",
];

export const popularSearches = [
  "Overshirt",
  "Merino crew",
  "Pleated trouser",
  "Straight jean",
  "Wool coat",
  "White tee",
];

export const defaultAddresses: Address[] = [
  {
    id: "addr-1",
    fullName: "Aarav Deshpande",
    phone: "+91 98204 41120",
    line1: "12 Sagar Villa, Carter Road",
    line2: "Bandra West",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400050",
    isDefault: true,
  },
  {
    id: "addr-2",
    fullName: "Aarav Deshpande",
    phone: "+91 98111 23344",
    line1: "402, Prestige Meridian, Lavelle Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    isDefault: false,
  },
];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const seedOrders: Order[] = [
  {
    id: "AVL2026074512",
    date: "2026-07-28",
    status: "Shipped",
    deliveryDate: "2026-08-16",
    paymentMethod: "UPI · Google Pay",
    address: defaultAddresses[0]!,
    items: [
      {
        productSlug: "warden-twill-overshirt",
        name: "Warden Twill Overshirt",
        size: "M",
        color: "Stone",
        quantity: 1,
        price: 5999,
      },
      {
        productSlug: "atlas-heavyweight-tee",
        name: "Atlas Heavyweight Tee",
        size: "M",
        color: "Ecru",
        quantity: 2,
        price: 1799,
      },
    ],
    subtotal: 9597,
    shipping: 0,
    tax: 480,
    total: 10077,
  },
  {
    id: "AVL2026061188",
    date: "2026-06-11",
    status: "Delivered",
    deliveryDate: "2026-06-14",
    paymentMethod: "Credit Card · HDFC ····4412",
    address: defaultAddresses[1]!,
    items: [
      {
        productSlug: "ridge-merino-crew",
        name: "Ridge Merino Crew",
        size: "L",
        color: "Charcoal",
        quantity: 1,
        price: 6999,
      },
    ],
    subtotal: 6999,
    shipping: 0,
    tax: 350,
    total: 7349,
  },
  {
    id: "AVL2026050377",
    date: "2026-05-03",
    status: "Delivered",
    deliveryDate: "2026-05-07",
    paymentMethod: "Cash on Delivery",
    address: defaultAddresses[0]!,
    items: [
      {
        productSlug: "north-straight-jean",
        name: "North Straight Jean",
        size: "32",
        color: "Indigo",
        quantity: 1,
        price: 5499,
      },
      {
        productSlug: "meridian-leather-belt",
        name: "Meridian Leather Belt",
        size: "32",
        color: "Clay",
        quantity: 1,
        price: 2999,
      },
    ],
    subtotal: 8498,
    shipping: 0,
    tax: 425,
    total: 8923,
  },
];

export const COUPONS: Record<string, { type: "percent" | "flat"; value: number; label: string }> = {
  AVELOR10: { type: "percent", value: 10, label: "10% off your order" },
  FIRST500: { type: "flat", value: 500, label: "₹500 off your first order" },
  STUDIO15: { type: "percent", value: 15, label: "15% off — studio friends" },
};

export const faqs: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Orders",
    items: [
      { q: "Can I change my order after placing it?", a: "Orders can be edited within 60 minutes of placing them. Write to care@avelor.in with your order number and we will update it before it reaches the studio." },
      { q: "How do I cancel an order?", a: "Open Account → Orders, select the order and choose Cancel. Cancellation is available until the order is marked Packed." },
      { q: "Do you take orders over WhatsApp?", a: "Yes. Message +91 98204 41120 and our studio team will place the order for you and share a payment link." },
    ],
  },
  {
    category: "Shipping",
    items: [
      { q: "How long does delivery take?", a: "Metro cities receive orders in 2–3 working days. Other serviceable PIN codes take 4–6 working days." },
      { q: "Is shipping free?", a: "Shipping is complimentary on orders above ₹1,999. Below that, a flat ₹99 applies." },
      { q: "Can I track my order?", a: "Every order ships with a tracking link over SMS and email, and appears under Account → Orders." },
    ],
  },
  {
    category: "Returns",
    items: [
      { q: "What is the return window?", a: "You have 15 days from delivery to return an unworn piece with its tags intact." },
      { q: "Are exchanges free?", a: "First exchange on any order is free within India." },
      { q: "How long do refunds take?", a: "Refunds reach the original payment method 5–7 working days after the piece reaches our studio." },
    ],
  },
  {
    category: "Payments",
    items: [
      { q: "Which payment methods do you accept?", a: "UPI (Google Pay, PhonePe, Paytm), credit and debit cards, net banking, and cash on delivery." },
      { q: "Is cash on delivery available everywhere?", a: "COD is available on orders up to ₹10,000 across most serviceable PIN codes." },
      { q: "Do you store card details?", a: "No. Payments are handled by our payment partner and card details never reach our servers." },
    ],
  },
  {
    category: "Products",
    items: [
      { q: "Where are AVELOR pieces made?", a: "Everything is cut and stitched in two partner units in Mumbai, using fabrics milled in Tamil Nadu and Gujarat." },
      { q: "Will a piece be restocked?", a: "Essentials are restocked continuously. Limited pieces are made once — use Notify Me on the product page." },
      { q: "How should I care for wool?", a: "Dry clean or hand wash cold with a wool detergent, then dry flat away from sunlight." },
    ],
  },
  {
    category: "Sizing",
    items: [
      { q: "How do your fits run?", a: "Relaxed and oversized styles carry roughly 5cm extra through the chest. If you are between sizes, size down for a cleaner line." },
      { q: "Do you offer alterations?", a: "Trouser hemming is complimentary at our Mumbai studio." },
      { q: "Where can I find measurements?", a: "Every product page links to the full size guide with chest, waist, hip, shoulder and length in centimetres." },
    ],
  },
  {
    category: "Account",
    items: [
      { q: "Do I need an account to order?", a: "No, guest checkout is available. An account keeps your addresses and order history in one place." },
      { q: "How do I reset my password?", a: "Use Forgot Password on the sign-in page and we will send a reset link to your registered email." },
      { q: "Can I delete my account?", a: "Write to care@avelor.in and we will remove your data within 7 working days." },
    ],
  },
];

export const sizeGuide = {
  Men: {
    Tops: {
      columns: ["Size", "Chest (cm)", "Waist (cm)", "Shoulder (cm)", "Length (cm)", "UK / EU / US"],
      rows: [
        ["XS", "88–92", "74–78", "42", "68", "34 / 44 / XS"],
        ["S", "94–98", "80–84", "44", "70", "36 / 46 / S"],
        ["M", "100–104", "86–90", "46", "72", "38 / 48 / M"],
        ["L", "106–110", "92–96", "48", "74", "40 / 50 / L"],
        ["XL", "112–116", "98–102", "50", "76", "42 / 52 / XL"],
        ["XXL", "118–122", "104–108", "52", "78", "44 / 54 / XXL"],
      ],
    },
    Bottoms: {
      columns: ["Size", "Waist (cm)", "Hip (cm)", "Inseam (cm)", "UK / EU / US"],
      rows: [
        ["28", "71", "92", "76", "28 / 44 / 28"],
        ["30", "76", "97", "77", "30 / 46 / 30"],
        ["32", "81", "102", "78", "32 / 48 / 32"],
        ["34", "86", "107", "79", "34 / 50 / 34"],
        ["36", "91", "112", "80", "36 / 52 / 36"],
        ["38", "96", "117", "81", "38 / 54 / 38"],
      ],
    },
    Outerwear: {
      columns: ["Size", "Chest (cm)", "Shoulder (cm)", "Sleeve (cm)", "Length (cm)"],
      rows: [
        ["XS", "96", "44", "62", "72"],
        ["S", "102", "46", "63", "74"],
        ["M", "108", "48", "64", "76"],
        ["L", "114", "50", "65", "78"],
        ["XL", "120", "52", "66", "80"],
        ["XXL", "126", "54", "67", "82"],
      ],
    },
  },
  Women: {
    Tops: {
      columns: ["Size", "Bust (cm)", "Waist (cm)", "Shoulder (cm)", "Length (cm)", "UK / EU / US"],
      rows: [
        ["XS", "80–84", "62–66", "37", "60", "6 / 34 / 2"],
        ["S", "86–90", "68–72", "38", "62", "8 / 36 / 4"],
        ["M", "92–96", "74–78", "39", "64", "10 / 38 / 6"],
        ["L", "98–102", "80–84", "40", "66", "12 / 40 / 8"],
        ["XL", "104–108", "86–90", "41", "68", "14 / 42 / 10"],
        ["XXL", "110–114", "92–96", "42", "70", "16 / 44 / 12"],
      ],
    },
    Bottoms: {
      columns: ["Size", "Waist (cm)", "Hip (cm)", "Inseam (cm)", "UK / EU / US"],
      rows: [
        ["24", "61", "86", "73", "6 / 34 / 2"],
        ["26", "66", "91", "74", "8 / 36 / 4"],
        ["28", "71", "96", "75", "10 / 38 / 6"],
        ["30", "76", "101", "76", "12 / 40 / 8"],
        ["32", "81", "106", "77", "14 / 42 / 10"],
        ["34", "86", "111", "78", "16 / 44 / 12"],
      ],
    },
    Outerwear: {
      columns: ["Size", "Bust (cm)", "Shoulder (cm)", "Sleeve (cm)", "Length (cm)"],
      rows: [
        ["XS", "90", "39", "59", "88"],
        ["S", "96", "40", "60", "90"],
        ["M", "102", "41", "61", "92"],
        ["L", "108", "42", "62", "94"],
        ["XL", "114", "43", "63", "96"],
        ["XXL", "120", "44", "64", "98"],
      ],
    },
  },
};
