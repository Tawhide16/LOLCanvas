const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

// Initial template seed data
const initialTemplates = [
  {
    slug: "drake-hotline",
    title: "Drake Hotline Bling",
    category: "reaction",
    tags: ["drake", "hotline bling", "nah yeah", "approval", "rejection"],
    width: 800,
    height: 800,
    defaultTopText: "LEGACY WATERMARKED MEMES",
    defaultBottomText: "LOLCANVAS CLEAN PNG EXPORT",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800' viewBox='0 0 800 800'><rect width='800' height='800' fill='%23FAF9F5'/><rect x='0' y='0' width='400' height='400' fill='%23EA580C'/><rect x='0' y='400' width='400' height='400' fill='%23F97316'/><path d='M160 170c0-40 30-70 70-70s70 30 70 70-30 70-70 70-70-30-70-70z' fill='%2378350F'/><path d='M160 570c0-40 30-70 70-70s70 30 70 70-30 70-70 70-70-30-70-70z' fill='%2378350F'/><path d='M230 190q-30 30-60 0' stroke='%23000' stroke-width='8' fill='none'/><path d='M200 590q30 30 60 0' stroke='%23000' stroke-width='8' fill='none'/><line x1='0' y1='400' x2='800' y2='400' stroke='%23000' stroke-width='4'/><line x1='400' y1='0' x2='400' y2='800' stroke='%23000' stroke-width='4'/></svg>",
  },
  {
    slug: "distracted-bf",
    title: "Distracted Boyfriend",
    category: "relatable",
    tags: ["distracted", "boyfriend", "jealous", "girlfriend"],
    width: 900,
    height: 600,
    defaultTopText: "NEW TECH STACK",
    defaultBottomText: "LEGACY MONOLITH",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='900' height='600' viewBox='0 0 900 600'><rect width='900' height='600' fill='%23D1D5DB'/><circle cx='250' cy='300' r='60' fill='%23EF4444'/><circle cx='450' cy='280' r='60' fill='%233B82F6'/><circle cx='650' cy='300' r='60' fill='%2310B981'/><path d='M470 260l70-30' stroke='%23000' stroke-width='8'/><path d='M630 280l-50 10' stroke='%23000' stroke-width='8'/></svg>",
  },
  {
    slug: "expanding-brain",
    title: "Expanding Brain",
    category: "classic",
    tags: ["galaxy brain", "evolution", "intellect", "tiers"],
    width: 800,
    height: 1000,
    defaultTopText: "NORMAL CODE",
    defaultBottomText: "SWISS NEO-BRUTALISM",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000' viewBox='0 0 800 1000'><rect width='800' height='1000' fill='%23FFFFFF'/><line x1='400' y1='0' x2='400' y2='1000' stroke='%23000' stroke-width='4'/><line x1='0' y1='250' x2='800' y2='250' stroke='%23000' stroke-width='4'/><line x1='0' y1='500' x2='800' y2='500' stroke='%23000' stroke-width='4'/><line x1='0' y1='750' x2='800' y2='750' stroke='%23000' stroke-width='4'/><circle cx='600' cy='125' r='40' fill='%234B5563'/><circle cx='600' cy='375' r='50' fill='%233B82F6'/><circle cx='600' cy='625' r='60' fill='%238B5CF6'/><circle cx='600' cy='875' r='70' fill='%23EC4899'/></svg>",
  },
];

async function main() {
  console.log("Seeding initial templates into Neon DB...");
  for (const tpl of initialTemplates) {
    await prisma.template.upsert({
      where: { slug: tpl.slug },
      update: {},
      create: {
        slug: tpl.slug,
        title: tpl.title,
        category: tpl.category,
        tags: tpl.tags,
        svgDataUri: tpl.svgDataUri,
        width: tpl.width,
        height: tpl.height,
        defaultTopText: tpl.defaultTopText,
        defaultBottomText: tpl.defaultBottomText,
        isFeatured: true,
      },
    });
  }
  const count = await prisma.template.count();
  console.log(`Success! Total templates now in Neon DB: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
