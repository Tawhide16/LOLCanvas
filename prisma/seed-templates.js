const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const allTemplates = [
  {
    slug: "drake-hotline",
    title: "DRAKE HOTLINE BLING",
    category: "reaction",
    tags: ["drake", "disapproval", "approval", "hotline bling", "two panel", "reaction"],
    width: 800,
    height: 800,
    defaultTopText: "LEGACY WATERMARKED MEMES",
    defaultBottomText: "LOLCANVAS CLEAN PNG EXPORT",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' width='800' height='800'><rect width='800' height='800' fill='%23EADBC8'/><rect x='0' y='0' width='400' height='400' fill='%23F4A261'/><rect x='0' y='400' width='400' height='400' fill='%23E76F51'/><circle cx='210' cy='180' r='85' fill='%239C6644'/><circle cx='210' cy='580' r='85' fill='%239C6644'/><line x1='0' y1='400' x2='800' y2='400' stroke='%23000' stroke-width='4'/><line x1='400' y1='0' x2='400' y2='800' stroke='%23000' stroke-width='4'/></svg>",
  },
  {
    slug: "distracted-bf",
    title: "DISTRACTED BOYFRIEND",
    category: "relatable",
    tags: ["distracted", "boyfriend", "jealous", "girlfriend", "street", "stare"],
    width: 900,
    height: 600,
    defaultTopText: "NEW TECH STACK",
    defaultBottomText: "LEGACY MONOLITH",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600' width='900' height='600'><rect width='900' height='600' fill='%23E2E8F0'/><circle cx='240' cy='280' r='60' fill='%23EF4444'/><circle cx='470' cy='260' r='60' fill='%233B82F6'/><circle cx='700' cy='280' r='60' fill='%2310B981'/></svg>",
  },
  {
    slug: "two-buttons",
    title: "TWO BUTTONS DILEMMA",
    category: "relatable",
    tags: ["two buttons", "sweating", "dilemma", "hard choice", "buttons"],
    width: 800,
    height: 900,
    defaultTopText: "SHIP ON FRIDAY",
    defaultBottomText: "WAIT TILL MONDAY",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 900' width='800' height='900'><rect width='800' height='900' fill='%23F1F5F9'/><rect x='100' y='100' width='250' height='120' rx='20' fill='%23EF4444'/><rect x='450' y='100' width='250' height='120' rx='20' fill='%23EF4444'/><circle cx='400' cy='600' r='140' fill='%23CBD5E1'/></svg>",
  },
  {
    slug: "change-my-mind",
    title: "CHANGE MY MIND",
    category: "classic",
    tags: ["change my mind", "steven crowder", "campus sign", "debate"],
    width: 960,
    height: 640,
    defaultTopText: "CSS VANILLA IS SUPERIOR",
    defaultBottomText: "CHANGE MY MIND",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 960 640' width='960' height='640'><rect width='960' height='640' fill='%23E2E8F0'/><rect x='200' y='320' width='560' height='240' fill='%23FFFFFF' stroke='%23000' stroke-width='4'/></svg>",
  },
  {
    slug: "buff-doge-cheems",
    title: "BUFF DOGE VS CHEEMS",
    category: "animals",
    tags: ["doge", "cheems", "shiba inu", "strong vs weak", "comparison"],
    width: 1000,
    height: 700,
    defaultTopText: "DEV IN 2005 (C++ ASM)",
    defaultBottomText: "DEV IN 2026 (NPM INSTALL)",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 700' width='1000' height='700'><rect width='1000' height='700' fill='%23F8FAFC'/><rect x='80' y='150' width='380' height='480' rx='40' fill='%23E2E8F0'/><rect x='580' y='300' width='340' height='330' rx='40' fill='%23E2E8F0'/></svg>",
  },
  {
    slug: "woman-yelling-cat",
    title: "WOMAN YELLING AT SMUDGE",
    category: "animals",
    tags: ["woman yelling", "cat", "smudge", "dinner table", "screaming cat"],
    width: 1000,
    height: 550,
    defaultTopText: "YOU SAID IT WAS BUG FREE",
    defaultBottomText: "CONSOLE.LOG('HERE')",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 550' width='1000' height='550'><rect width='1000' height='550' fill='%23F1F5F9'/><line x1='500' y1='0' x2='500' y2='550' stroke='%23000' stroke-width='4'/><circle cx='250' cy='250' r='100' fill='%23FED7AA'/><circle cx='750' cy='250' r='90' fill='%23FFFFFF' stroke='%23000' stroke-width='4'/></svg>",
  },
  {
    slug: "expanding-brain",
    title: "EXPANDING BRAIN",
    category: "classic",
    tags: ["galaxy brain", "evolution", "intellect", "tiers", "levels"],
    width: 800,
    height: 1000,
    defaultTopText: "NORMAL CODE",
    defaultBottomText: "SWISS NEO-BRUTALISM",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000' width='800' height='1000'><rect width='800' height='1000' fill='%23FFFFFF'/><line x1='400' y1='0' x2='400' y2='1000' stroke='%23000' stroke-width='4'/><line x1='0' y1='250' x2='800' y2='250' stroke='%23000' stroke-width='4'/><line x1='0' y1='500' x2='800' y2='500' stroke='%23000' stroke-width='4'/><line x1='0' y1='750' x2='800' y2='750' stroke='%23000' stroke-width='4'/></svg>",
  },
  {
    slug: "is-this-a-pigeon",
    title: "IS THIS A PIGEON?",
    category: "reaction",
    tags: ["butterfly", "pigeon", "anime", "misunderstanding", "yutaro"],
    width: 900,
    height: 600,
    defaultTopText: "IS THIS A FULL STACK FRAMEWORK?",
    defaultBottomText: "",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600' width='900' height='600'><rect width='900' height='600' fill='%23E0F2FE'/><circle cx='300' cy='320' r='100' fill='%23BAE6FD'/><circle cx='680' cy='200' r='40' fill='%23FEF08A'/></svg>",
  },
  {
    slug: "stonks-market",
    title: "STONKS MAN",
    category: "crypto",
    tags: ["stonks", "stock market", "meme man", "finance", "crypto", "up only"],
    width: 850,
    height: 600,
    defaultTopText: "BOUGHT THE TOP",
    defaultBottomText: "STONKS",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 850 600' width='850' height='600'><rect width='850' height='600' fill='%230F172A'/><path d='M100 500 L300 400 L500 450 L750 150' stroke='%23EA580C' stroke-width='14' fill='none'/><circle cx='400' cy='260' r='75' fill='%23E2E8F0'/></svg>",
  },
  {
    slug: "epic-handshake",
    title: "EPIC HANDSHAKE",
    category: "relatable",
    tags: ["predator", "dillon", "dutch", "biceps", "agreement", "unity"],
    width: 900,
    height: 600,
    defaultTopText: "FRONTEND DEVS",
    defaultBottomText: "BACKEND DEVS",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600' width='900' height='600'><rect width='900' height='600' fill='%23FEF3C7'/><path d='M100 400 Q350 250 450 350 Q550 450 800 300' stroke='%23B45309' stroke-width='40' fill='none'/></svg>",
  },
  {
    slug: "uno-draw-25",
    title: "DRAW 25 CARDS",
    category: "relatable",
    tags: ["uno", "draw 25", "stubborn", "refusal", "card game"],
    width: 800,
    height: 800,
    defaultTopText: "WRITE DOCUMENTATION",
    defaultBottomText: "OR DRAW 25 CARDS",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' width='800' height='800'><rect width='800' height='800' fill='%23FFF1F2'/><line x1='0' y1='400' x2='800' y2='400' stroke='%23000' stroke-width='4'/><rect x='150' y='80' width='200' height='280' rx='20' fill='%23E11D48'/><circle cx='550' cy='600' r='120' fill='%23FDA4AF'/></svg>",
  },
  {
    slug: "disaster-girl",
    title: "DISASTER GIRL",
    category: "classic",
    tags: ["disaster girl", "fire", "house fire", "smirk", "chaos"],
    width: 900,
    height: 650,
    defaultTopText: "ME DELETING PRODUCTION DB",
    defaultBottomText: "",
    svgDataUri: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 650' width='900' height='650'><rect width='900' height='650' fill='%23451A03'/><path d='M100 450 L300 200 L500 450 Z' fill='%23DC2626'/><circle cx='680' cy='420' r='90' fill='%23FED7AA'/></svg>",
  },
];

async function main() {
  console.log("Seeding all 12 templates into Neon DB...");
  for (const tpl of allTemplates) {
    await prisma.template.upsert({
      where: { slug: tpl.slug },
      update: {
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
  console.log(`Successfully synced! Total templates in Neon DB: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
