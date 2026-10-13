import { Category, Template } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "01",
    number: "01",
    slug: "funny-comedy",
    name: "Funny & Comedy",
    description: "Punchy, fast-turnaround comedic formats for everyday internet absurdity.",
    curationNote: "High satire index, verified punchlines, optimized for single-beat timing.",
    count: 3420,
  },
  {
    id: "02",
    number: "02",
    slug: "reaction",
    name: "Reaction",
    description: "Expressive emotional postures, silent stares, and exaggerated disbelief.",
    curationNote: "Universal emotional resonance; cropped for instant thumbnail readability.",
    count: 5120,
  },
  {
    id: "03",
    number: "03",
    slug: "animals",
    name: "Animals",
    description: "Canines, felines, capybaras, and unexpected wildlife dilemmas.",
    curationNote: "Certified high engagement; archival doge and smudge classics preserved.",
    count: 2890,
  },
  {
    id: "04",
    number: "04",
    slug: "gaming",
    name: "Gaming",
    description: "RNG heartbreak, patch note rage, NPC dialogues, and speedrun fails.",
    curationNote: "Context-dense; contains dual-label and dialogue box variants.",
    count: 2150,
  },
  {
    id: "05",
    number: "05",
    slug: "relatable",
    name: "Relatable",
    description: "Workplace dread, bedtime procrastination, and domestic quiet catastrophes.",
    curationNote: "Subtle observation-driven structures. High remix velocity.",
    count: 4890,
  },
  {
    id: "06",
    number: "06",
    slug: "classic",
    name: "Classic",
    description: "Historical Internet heritage dating from 2010 onwards. Canonized layouts.",
    curationNote: "Strictly preserved ratios and iconic impact font placements.",
    count: 3670,
  },
  {
    id: "07",
    number: "07",
    slug: "trending",
    name: "Trending",
    description: "Breakout formats currently overtaking group chats, X, and feeds.",
    curationNote: "Updated on 4-hour cycle. Moderated for fresh contextual spikes.",
    count: 1450,
  },
  {
    id: "08",
    number: "08",
    slug: "political-satire",
    name: "Political & Satire",
    description: "Institutional critique, geopolitical irony, and modern social commentary.",
    curationNote: "Neutral archival curation; watermark-free public domain commentary.",
    count: 980,
  },
];

// Helper to create encoded SVGs
function createSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export const TEMPLATES: Template[] = [
  {
    id: "drake-hotline",
    slug: "drake-hotline",
    index: "№ 0001",
    title: "DRAKE HOTLINE BLING",
    categoryId: "02",
    categoryName: "Reaction",
    format: "multi-panel",
    formatLabel: "2-Panel Compare",
    remixCount: 142850,
    downloadCount: 98200,
    createdAt: "2024-01-15",
    source: "Cash Money / OVO Sound (Visual Parody Archive)",
    license: "Fair Use / Editorial Parody",
    aspectRatio: "1:1",
    width: 800,
    height: 800,
    defaultTopText: "LEGACY WATERMARKED MEMES",
    defaultBottomText: "LOLCANVAS CLEAN PNG EXPORT",
    tags: ["drake", "disapproval", "approval", "hotline bling", "two panel", "reaction"],
    trendingRank: 1,
    svgDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
        <rect width="800" height="800" fill="#EADBC8" />
        <!-- Top Half: Disapproval -->
        <g id="panel-top">
          <rect x="0" y="0" width="400" height="400" fill="#F4A261" />
          <!-- Drake face & orange puffer jacket -->
          <circle cx="210" cy="180" r="85" fill="#9C6644" />
          <path d="M140 160 Q210 120 280 160 Q260 100 200 110 Q150 120 140 160 Z" fill="#2B1E16" />
          <path d="M180 170 Q160 185 190 190" stroke="#2B1E16" stroke-width="4" fill="none" />
          <path d="M225 170 Q240 185 215 190" stroke="#2B1E16" stroke-width="4" fill="none" />
          <path d="M185 215 Q205 200 225 215" stroke="#2B1E16" stroke-width="5" fill="none" stroke-linecap="round" />
          <!-- Beard -->
          <path d="M165 195 Q205 260 255 195 Q250 250 170 240 Z" fill="#2B1E16" opacity="0.8" />
          <!-- Puffer Jacket Body -->
          <path d="M100 250 L320 250 L350 400 L70 400 Z" fill="#E76F51" />
          <!-- Hand repelling / stop gesture -->
          <rect x="250" y="210" width="80" height="90" rx="20" fill="#9C6644" transform="rotate(-25 290 255)" />
          <line x1="260" y1="210" x2="310" y2="210" stroke="#7F4F24" stroke-width="4" />
          <text x="30" y="50" font-family="Space Mono, monospace" font-size="24" font-weight="bold" fill="#000000" opacity="0.3">PANEL 01: REJECTION</text>
          <!-- Empty Text Target Area -->
          <rect x="400" y="0" width="400" height="400" fill="#FAF9F5" stroke="#000000" stroke-width="2" />
          <rect x="420" y="20" width="360" height="360" fill="none" stroke="#D1CEC5" stroke-dasharray="6,6" stroke-width="2" />
          <text x="600" y="205" font-family="Space Mono, monospace" font-size="18" fill="#888888" text-anchor="middle">REJECTED CONCEPT AREA</text>
        </g>
        <!-- Divider -->
        <line x1="0" y1="400" x2="800" y2="400" stroke="#000000" stroke-width="4" />
        <line x1="400" y1="0" x2="400" y2="800" stroke="#000000" stroke-width="4" />
        <!-- Bottom Half: Approval -->
        <g id="panel-bottom">
          <rect x="0" y="400" width="400" height="400" fill="#F4A261" />
          <!-- Drake face smiling & pointing -->
          <circle cx="210" cy="560" r="85" fill="#9C6644" />
          <path d="M140 540 Q210 500 280 540 Q260 480 200 490 Q150 500 140 540 Z" fill="#2B1E16" />
          <!-- Eyes closed smile -->
          <path d="M175 555 Q190 545 205 555" stroke="#2B1E16" stroke-width="4" fill="none" stroke-linecap="round" />
          <path d="M220 555 Q235 545 250 555" stroke="#2B1E16" stroke-width="4" fill="none" stroke-linecap="round" />
          <!-- Big Smile -->
          <path d="M185 585 Q212 625 240 585 Z" fill="#FFFFFF" stroke="#2B1E16" stroke-width="3" />
          <!-- Beard -->
          <path d="M165 575 Q205 640 255 575 Q250 630 170 620 Z" fill="#2B1E16" opacity="0.8" />
          <!-- Jacket -->
          <path d="M100 630 L320 630 L350 800 L70 800 Z" fill="#E76F51" />
          <!-- Pointing Finger Hand -->
          <rect x="260" y="580" width="90" height="40" rx="15" fill="#9C6644" transform="rotate(15 305 600)" />
          <circle cx="345" cy="595" r="10" fill="#9C6644" />
          <text x="30" y="450" font-family="Space Mono, monospace" font-size="24" font-weight="bold" fill="#000000" opacity="0.3">PANEL 02: APPROVAL</text>
          <!-- Empty Text Target Area -->
          <rect x="400" y="400" width="400" height="400" fill="#FAF9F5" />
          <rect x="420" y="420" width="360" height="360" fill="none" stroke="#D1CEC5" stroke-dasharray="6,6" stroke-width="2" />
          <text x="600" y="605" font-family="Space Mono, monospace" font-size="18" fill="#888888" text-anchor="middle">APPROVED CONCEPT AREA</text>
        </g>
      </svg>
    `),
  },
  {
    id: "distracted-bf",
    slug: "distracted-bf",
    index: "№ 0002",
    title: "DISTRACTED BOYFRIEND",
    categoryId: "05",
    categoryName: "Relatable",
    format: "multi-panel",
    formatLabel: "Subject Triad",
    remixCount: 119400,
    downloadCount: 76300,
    createdAt: "2024-01-20",
    source: "Stock Photography Archive (Antonio Guillem)",
    license: "Editorial Parody",
    aspectRatio: "16:9",
    width: 1200,
    height: 675,
    defaultTopText: "NEW TECH STACK",
    defaultBottomText: "CURRENT STABLE CODEBASE",
    tags: ["distracted", "boyfriend", "girlfriend", "jealousy", "choice", "triad"],
    trendingRank: 2,
    svgDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#DDE5B6" />
        <!-- Street background perspective -->
        <polygon points="0,400 1200,400 1200,675 0,675" fill="#A98467" />
        <line x1="600" y1="400" x2="600" y2="675" stroke="#FFFFFF" stroke-width="6" stroke-dasharray="20,20" />
        
        <!-- Girl in Red (Left / Temptation) -->
        <g id="girl-in-red">
          <circle cx="280" cy="220" r="55" fill="#E0A96D" />
          <path d="M220 200 Q280 140 340 200 Q330 260 310 320 L250 320 Z" fill="#6B2D2D" />
          <polygon points="210,290 350,290 380,560 180,560" fill="#E63946" />
          <rect x="240" y="560" width="30" height="90" fill="#E0A96D" />
          <rect x="290" y="560" width="30" height="90" fill="#E0A96D" />
          <!-- Tag box for left character -->
          <rect x="130" y="330" width="280" height="50" fill="#000000" />
          <text x="270" y="362" font-family="Space Mono, monospace" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">[TEMPTATION / SHINY NEW OBJECT]</text>
        </g>

        <!-- Boyfriend (Center / Looking back) -->
        <g id="boyfriend">
          <circle cx="680" cy="210" r="60" fill="#DDB892" />
          <path d="M620 190 Q680 130 740 190 Q730 150 670 150 Z" fill="#4A3B32" />
          <!-- Head twisted back toward left -->
          <path d="M640 210 Q630 220 650 225" stroke="#000000" stroke-width="4" fill="none" />
          <polygon points="590,280 770,280 790,580 570,580" fill="#457B9D" />
          <rect x="620" y="580" width="40" height="90" fill="#1D3557" />
          <rect x="700" y="580" width="40" height="90" fill="#1D3557" />
          <!-- Center tag box -->
          <rect x="540" y="330" width="280" height="50" fill="#000000" />
          <text x="680" y="362" font-family="Space Mono, monospace" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">[THE DECISION MAKER / ME]</text>
        </g>

        <!-- Girlfriend in Blue (Right / Outraged) -->
        <g id="girlfriend">
          <circle cx="1000" cy="230" r="55" fill="#E0A96D" />
          <path d="M940 210 Q1000 150 1060 210 Q1060 290 1020 330 L980 330 Z" fill="#2B1E16" />
          <!-- Shocked angry eyes -->
          <circle cx="980" cy="225" r="8" fill="#FFFFFF" stroke="#000" stroke-width="2" />
          <circle cx="978" cy="225" r="4" fill="#000" />
          <polygon points="930,290 1070,290 1090,560 910,560" fill="#2A9D8F" />
          <rect x="950" y="560" width="30" height="90" fill="#E0A96D" />
          <rect x="1010" y="560" width="30" height="90" fill="#E0A96D" />
          <!-- Right tag box -->
          <rect x="860" y="330" width="280" height="50" fill="#000000" />
          <text x="1000" y="362" font-family="Space Mono, monospace" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle">[EXISTING RESPONSIBILITY]</text>
        </g>
      </svg>
    `),
  },
  {
    id: "expanding-brain",
    slug: "expanding-brain",
    index: "№ 0003",
    title: "EXPANDING BRAIN",
    categoryId: "01",
    categoryName: "Funny & Comedy",
    format: "multi-panel",
    formatLabel: "4-Tier Progression",
    remixCount: 96200,
    downloadCount: 65100,
    createdAt: "2024-02-01",
    source: "Internet Cultural Heritage",
    license: "Public Domain / CC0",
    aspectRatio: "4:5",
    width: 800,
    height: 1000,
    defaultTopText: "TIER 1: USING DEFAULT TOOLS",
    defaultBottomText: "TIER 4: TRANSCENDENT INTELLECT",
    tags: ["brain", "intelligence", "progression", "levels", "galaxy brain"],
    trendingRank: 3,
    svgDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
        <rect width="800" height="1000" fill="#0A0A0A" />
        <!-- Row 1: Small normal brain -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="400" height="250" fill="#FAF9F5" stroke="#000" stroke-width="2" />
          <text x="200" y="130" font-family="Space Mono, monospace" font-size="16" fill="#666" text-anchor="middle">LEVEL 01 CONCEPT</text>
          <rect x="400" y="0" width="400" height="250" fill="#1C1917" stroke="#000" stroke-width="2" />
          <circle cx="600" cy="125" r="45" fill="#44403C" stroke="#78716C" stroke-width="3" />
          <text x="600" y="210" font-family="Space Mono, monospace" font-size="12" fill="#A8A29E" text-anchor="middle">NORMAL BRAIN</text>
        </g>
        <!-- Row 2: Glowing brain -->
        <g transform="translate(0, 250)">
          <rect x="0" y="0" width="400" height="250" fill="#FAF9F5" stroke="#000" stroke-width="2" />
          <text x="200" y="130" font-family="Space Mono, monospace" font-size="16" fill="#666" text-anchor="middle">LEVEL 02 CONCEPT</text>
          <rect x="400" y="0" width="400" height="250" fill="#0F172A" stroke="#000" stroke-width="2" />
          <circle cx="600" cy="125" r="55" fill="#0284C7" opacity="0.6" />
          <circle cx="600" cy="125" r="40" fill="#38BDF8" />
          <text x="600" y="210" font-family="Space Mono, monospace" font-size="12" fill="#38BDF8" text-anchor="middle">LUMINOUS BRAIN</text>
        </g>
        <!-- Row 3: Cosmic neurons -->
        <g transform="translate(0, 500)">
          <rect x="0" y="0" width="400" height="250" fill="#FAF9F5" stroke="#000" stroke-width="2" />
          <text x="200" y="130" font-family="Space Mono, monospace" font-size="16" fill="#666" text-anchor="middle">LEVEL 03 CONCEPT</text>
          <rect x="400" y="0" width="400" height="250" fill="#1E1B4B" stroke="#000" stroke-width="2" />
          <circle cx="600" cy="125" r="70" fill="#6366F1" opacity="0.4" />
          <circle cx="600" cy="125" r="45" fill="#818CF8" />
          <line x1="530" y1="90" x2="670" y2="160" stroke="#C7D2FE" stroke-width="3" />
          <line x1="540" y1="160" x2="660" y2="90" stroke="#C7D2FE" stroke-width="3" />
          <text x="600" y="215" font-family="Space Mono, monospace" font-size="12" fill="#C7D2FE" text-anchor="middle">COSMIC NETWORK</text>
        </g>
        <!-- Row 4: Transcendent enlightenment -->
        <g transform="translate(0, 750)">
          <rect x="0" y="0" width="400" height="250" fill="#FAF9F5" stroke="#000" stroke-width="2" />
          <text x="200" y="130" font-family="Space Mono, monospace" font-size="16" fill="#666" text-anchor="middle">LEVEL 04 CONCEPT</text>
          <rect x="400" y="0" width="400" height="250" fill="#450A0A" stroke="#000" stroke-width="2" />
          <circle cx="600" cy="125" r="95" fill="#F43F5E" opacity="0.3" />
          <circle cx="600" cy="125" r="60" fill="#FB7185" />
          <polygon points="600,30 630,120 720,125 635,145 600,220 565,145 480,125 570,120" fill="#FFF1F2" opacity="0.9" />
          <text x="600" y="215" font-family="Space Mono, monospace" font-size="12" font-weight="bold" fill="#FFE4E6" text-anchor="middle">DIVINE ENLIGHTENMENT</text>
        </g>
        <!-- Outer Grid Lines -->
        <line x1="0" y1="250" x2="800" y2="250" stroke="#000" stroke-width="4" />
        <line x1="0" y1="500" x2="800" y2="500" stroke="#000" stroke-width="4" />
        <line x1="0" y1="750" x2="800" y2="750" stroke="#000" stroke-width="4" />
        <line x1="400" y1="0" x2="400" y2="1000" stroke="#000" stroke-width="4" />
      </svg>
    `),
  },
  {
    id: "woman-yelling-cat",
    slug: "woman-yelling-cat",
    index: "№ 0004",
    title: "WOMAN YELLING AT CAT",
    categoryId: "03",
    categoryName: "Animals",
    format: "multi-panel",
    formatLabel: "2-Panel Confrontation",
    remixCount: 88400,
    downloadCount: 59300,
    createdAt: "2024-02-10",
    source: "Bravo TV & @smudge_lord",
    license: "Parody Archive",
    aspectRatio: "16:9",
    width: 1200,
    height: 675,
    defaultTopText: "YOU PROMISED NO CODE CHANGES ON FRIDAY",
    defaultBottomText: "ME PUSHING STRAIGHT TO PRODUCTION",
    tags: ["cat", "smudge", "woman yelling", "confrontation", "dinner", "confusion"],
    trendingRank: 4,
    svgDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#1C1917" />
        <!-- Left Panel: Woman screaming & pointing -->
        <g id="panel-woman">
          <rect x="0" y="0" width="596" height="675" fill="#3F1D38" />
          <circle cx="280" cy="260" r="90" fill="#FDBA74" />
          <path d="M190 220 Q280 120 370 220 Q360 380 340 400 L210 400 Z" fill="#FDE047" />
          <!-- Open screaming mouth -->
          <ellipse cx="280" cy="300" rx="35" ry="45" fill="#881337" />
          <ellipse cx="280" cy="290" rx="20" ry="10" fill="#FFFFFF" />
          <!-- Pointing finger -->
          <path d="M380 340 L540 280 L520 320 Z" fill="#FDBA74" />
          <!-- Friend restraining her -->
          <circle cx="160" cy="290" r="70" fill="#D6D3D1" opacity="0.8" />
          <text x="300" y="600" font-family="Space Mono, monospace" font-size="20" font-weight="bold" fill="#FBCFE8" text-anchor="middle">[ACCUSING PARTY / PASSIONATE RANT]</text>
        </g>
        <!-- Center Divider -->
        <rect x="596" y="0" width="8" height="675" fill="#000000" />
        <!-- Right Panel: Smudge the Cat at dinner table -->
        <g id="panel-cat">
          <rect x="604" y="0" width="596" height="675" fill="#1E293B" />
          <!-- Table and salad plate -->
          <ellipse cx="900" cy="560" rx="260" ry="80" fill="#475569" />
          <ellipse cx="900" cy="540" rx="150" ry="40" fill="#E2E8F0" />
          <circle cx="880" cy="535" rx="30" ry="15" fill="#22C55E" />
          <!-- Smudge White Cat Head -->
          <circle cx="900" cy="310" r="110" fill="#FFFFFF" />
          <!-- Cat ears -->
          <polygon points="810,240 850,150 890,230" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="4" />
          <polygon points="910,230 950,150 990,240" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="4" />
          <!-- Squinted confused cat eyes -->
          <ellipse cx="850" cy="300" rx="14" ry="7" fill="#0F172A" transform="rotate(-10 850 300)" />
          <ellipse cx="950" cy="300" rx="14" ry="7" fill="#0F172A" transform="rotate(10 950 300)" />
          <polygon points="890,330 910,330 900,345" fill="#F472B6" />
          <text x="900" y="600" font-family="Space Mono, monospace" font-size="20" font-weight="bold" fill="#93C5FD" text-anchor="middle">[CONFUSED INNOCENT FELINE]</text>
        </g>
      </svg>
    `),
  },
  {
    id: "buff-doge-cheems",
    slug: "buff-doge-cheems",
    index: "№ 0005",
    title: "BUFF DOGE VS CHEEMS",
    categoryId: "03",
    categoryName: "Animals",
    format: "multi-panel",
    formatLabel: "Comparative Scale",
    remixCount: 77500,
    downloadCount: 52100,
    createdAt: "2024-02-15",
    source: "Shiba Inu Internet Collective",
    license: "CC0 / Open Culture",
    aspectRatio: "16:9",
    width: 1200,
    height: 675,
    defaultTopText: "SOFTWARE ENGINEERS IN 1970 WRITING COMPILERS IN C",
    defaultBottomText: "SOFTWARE ENGINEERS IN 2026 WHEN DOCKER TAKES 2 SECONDS",
    tags: ["doge", "cheems", "shiba", "buff", "comparison", "strong vs weak"],
    trendingRank: 5,
    svgDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#F5EBE0" />
        <line x1="600" y1="0" x2="600" y2="675" stroke="#000000" stroke-width="2" stroke-dasharray="8,8" />
        <!-- Left: Gigantic Muscular Buff Doge -->
        <g id="buff-doge">
          <rect x="150" y="160" width="280" height="360" rx="80" fill="#D4A373" stroke="#8C5329" stroke-width="6" />
          <!-- Pectoral muscles -->
          <ellipse cx="230" cy="300" rx="55" ry="45" fill="#E6CCB2" stroke="#8C5329" stroke-width="4" />
          <ellipse cx="350" cy="300" rx="55" ry="45" fill="#E6CCB2" stroke="#8C5329" stroke-width="4" />
          <!-- Doge Head -->
          <circle cx="290" cy="130" r="50" fill="#E6CCB2" stroke="#8C5329" stroke-width="4" />
          <circle cx="275" cy="120" r="6" fill="#000" />
          <circle cx="305" cy="120" r="6" fill="#000" />
          <text x="290" y="580" font-family="Space Mono, monospace" font-size="22" font-weight="bold" fill="#000000" text-anchor="middle">ERA OF UNSTOPPABLE GIANTS</text>
        </g>
        <!-- Right: Small Sad Round Cheems -->
        <g id="sad-cheems">
          <ellipse cx="880" cy="420" rx="120" ry="90" fill="#D4A373" stroke="#8C5329" stroke-width="4" />
          <circle cx="820" cy="360" r="45" fill="#E6CCB2" stroke="#8C5329" stroke-width="4" />
          <!-- Slanted sad eyes -->
          <line x1="800" y1="350" x2="815" y2="355" stroke="#000" stroke-width="4" />
          <line x1="835" y1="355" x2="850" y2="350" stroke="#000" stroke-width="4" />
          <text x="880" y="580" font-family="Space Mono, monospace" font-size="22" font-weight="bold" fill="#000000" text-anchor="middle">FRAGILE MODERN EXISTENCE</text>
        </g>
      </svg>
    `),
  },
  {
    id: "roll-safe",
    slug: "roll-safe",
    index: "№ 0006",
    title: "ROLL SAFE / THINK ABOUT IT",
    categoryId: "02",
    categoryName: "Reaction",
    format: "classic",
    formatLabel: "Classic Top/Bottom",
    remixCount: 71200,
    downloadCount: 48900,
    createdAt: "2024-02-20",
    source: "BBC Three / #HoodDocumentary",
    license: "Editorial Parody",
    aspectRatio: "1:1",
    width: 800,
    height: 800,
    defaultTopText: "YOU CANNOT FAIL CODE REVIEW",
    defaultBottomText: "IF YOU NEVER WRITE CODE",
    tags: ["roll safe", "kayode ewumi", "smart", "brain", "think about it", "logic"],
    trendingRank: 6,
    svgDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
        <rect width="800" height="800" fill="#2B2D42" />
        <!-- Head -->
        <circle cx="430" cy="380" r="170" fill="#5E3023" />
        <path d="M300 320 Q430 200 560 320 Q540 220 430 220 Z" fill="#1C0F0B" />
        <!-- Confident sly smirk -->
        <path d="M410 440 Q470 480 520 420" stroke="#1C0F0B" stroke-width="6" fill="none" stroke-linecap="round" />
        <!-- Eyes looking knowingly at audience -->
        <ellipse cx="430" cy="360" rx="14" ry="18" fill="#FFFFFF" />
        <circle cx="435" cy="360" r="8" fill="#1C0F0B" />
        <ellipse cx="500" cy="360" rx="14" ry="18" fill="#FFFFFF" />
        <circle cx="505" cy="360" r="8" fill="#1C0F0B" />
        <!-- Finger tapping temple -->
        <path d="M260 520 L330 380 L350 385 L310 540 Z" fill="#5E3023" stroke="#3D1E16" stroke-width="4" />
        <circle cx="340" cy="375" r="18" fill="#5E3023" />
        <!-- Leather Jacket -->
        <path d="M180 560 L680 560 L750 800 L120 800 Z" fill="#111111" />
        <polygon points="400,560 460,560 430,680" fill="#8D99AE" />
      </svg>
    `),
  },
  {
    id: "two-buttons",
    slug: "two-buttons",
    index: "№ 0007",
    title: "TWO BUTTONS / DAILY STRUGGLE",
    categoryId: "01",
    categoryName: "Funny & Comedy",
    format: "multi-panel",
    formatLabel: "Dilemma Choice",
    remixCount: 65800,
    downloadCount: 44200,
    createdAt: "2024-03-01",
    source: "Jake Clark / Daily Struggle Comic",
    license: "CC BY-SA 4.0",
    aspectRatio: "1:1",
    width: 800,
    height: 800,
    defaultTopText: "FIX EXISTING PRODUCTION BUGS",
    defaultBottomText: "REWRITE THE ENTIRE APP IN RUST",
    tags: ["two buttons", "sweat", "choice", "dilemma", "struggle", "buttons"],
    trendingRank: 7,
    svgDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
        <rect width="800" height="800" fill="#E2E8F0" />
        <!-- Control panel with 2 red buttons -->
        <polygon points="100,100 700,100 760,400 40,400" fill="#94A3B8" stroke="#334155" stroke-width="6" />
        <!-- Button Left -->
        <ellipse cx="260" cy="240" rx="90" ry="50" fill="#EF4444" stroke="#991B1B" stroke-width="6" />
        <text x="260" y="248" font-family="Space Mono, monospace" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">BUTTON A</text>
        <!-- Button Right -->
        <ellipse cx="540" cy="240" rx="90" ry="50" fill="#EF4444" stroke="#991B1B" stroke-width="6" />
        <text x="540" y="248" font-family="Space Mono, monospace" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle">BUTTON B</text>
        <!-- Sweating Superhero / Character Bottom -->
        <g id="character-sweating">
          <circle cx="400" cy="620" r="140" fill="#FCA5A5" stroke="#991B1B" stroke-width="6" />
          <!-- Red glove holding white towel wiping forehead -->
          <ellipse cx="500" cy="540" rx="45" ry="30" fill="#DC2626" />
          <path d="M460 520 Q520 480 550 560" fill="#FFFFFF" stroke="#000" stroke-width="3" />
          <!-- Giant sweat drops -->
          <path d="M330 520 Q310 550 330 570 Q350 550 330 520 Z" fill="#38BDF8" stroke="#0284C7" stroke-width="2" />
          <path d="M370 490 Q355 515 370 530 Q385 515 370 490 Z" fill="#38BDF8" stroke="#0284C7" stroke-width="2" />
          <!-- Stressed eyes -->
          <circle cx="340" cy="610" r="14" fill="#FFFFFF" stroke="#000" stroke-width="3" />
          <circle cx="342" cy="610" r="6" fill="#000" />
          <circle cx="420" cy="610" r="14" fill="#FFFFFF" stroke="#000" stroke-width="3" />
          <circle cx="422" cy="610" r="6" fill="#000" />
        </g>
      </svg>
    `),
  },
  {
    id: "trade-offer",
    slug: "trade-offer",
    index: "№ 0008",
    title: "TRADE OFFER",
    categoryId: "07",
    categoryName: "Trending",
    format: "tweet",
    formatLabel: "Transaction Card",
    remixCount: 59300,
    downloadCount: 38700,
    createdAt: "2024-03-10",
    source: "TikTok / @bradeazy",
    license: "CC BY-SA 4.0",
    aspectRatio: "1:1",
    width: 800,
    height: 800,
    defaultTopText: "i receive: 100% WATERMARK-FREE MEMES",
    defaultBottomText: "you receive: CLEAN HIGH-RES EXPORT",
    tags: ["trade offer", "deal", "negotiation", "hands", "bradeazy", "exchange"],
    trendingRank: 8,
    svgDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
        <rect width="800" height="800" fill="#0F172A" />
        <!-- Header Banner -->
        <rect x="50" y="40" width="700" height="80" fill="#E11D48" />
        <text x="400" y="92" font-family="Space Grotesk, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">⚠ TRADE OFFER ⚠</text>
        
        <!-- Suited Man in middle with hands open forward -->
        <circle cx="400" cy="290" r="95" fill="#E2E8F0" />
        <path d="M260 400 L540 400 L580 800 L220 800 Z" fill="#1E293B" />
        <polygon points="360,400 440,400 400,560" fill="#FFFFFF" />
        <polygon points="390,420 410,420 400,540" fill="#E11D48" />
        <!-- Open hands pointing at camera -->
        <ellipse cx="250" cy="460" rx="45" ry="35" fill="#E2E8F0" stroke="#000" stroke-width="4" />
        <ellipse cx="550" cy="460" rx="45" ry="35" fill="#E2E8F0" stroke="#000" stroke-width="4" />
        
        <!-- Trade Terms boxes -->
        <rect x="60" y="550" width="310" height="180" fill="#000000" stroke="#E11D48" stroke-width="3" />
        <text x="215" y="590" font-family="Space Mono, monospace" font-size="16" fill="#F43F5E" text-anchor="middle">i receive:</text>
        <text x="215" y="640" font-family="Space Grotesk, sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">[YOUR ASSET]</text>

        <rect x="430" y="550" width="310" height="180" fill="#000000" stroke="#10B981" stroke-width="3" />
        <text x="585" y="590" font-family="Space Mono, monospace" font-size="16" fill="#34D399" text-anchor="middle">you receive:</text>
        <text x="585" y="640" font-family="Space Grotesk, sans-serif" font-size="18" font-weight="bold" fill="#FFFFFF" text-anchor="middle">[ZERO VALUE / REGRET]</text>
      </svg>
    `),
  },
  {
    id: "change-my-mind",
    slug: "change-my-mind",
    index: "№ 0009",
    title: "CHANGE MY MIND",
    categoryId: "08",
    categoryName: "Political & Satire",
    format: "tweet",
    formatLabel: "Table Dialogue",
    remixCount: 54100,
    downloadCount: 36200,
    createdAt: "2024-03-15",
    source: "Louder with Crowder College Tour",
    license: "Editorial Commentary",
    aspectRatio: "16:9",
    width: 1200,
    height: 675,
    defaultTopText: "CSS IN JS WAS A MISTAKE",
    defaultBottomText: "CHANGE MY MIND",
    tags: ["change my mind", "desk", "coffee mug", "campus", "debate", "opinion"],
    trendingRank: 9,
    svgDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#E5E7EB" />
        <!-- Campus trees and sky -->
        <rect x="0" y="0" width="1200" height="350" fill="#BFDBFE" />
        <polygon points="100,350 250,150 400,350" fill="#15803D" />
        <polygon points="800,350 950,120 1100,350" fill="#166534" />
        <!-- Grass lawn -->
        <rect x="0" y="350" width="1200" height="325" fill="#86EFAC" />
        
        <!-- White folding table -->
        <polygon points="350,380 950,380 1020,580 280,580" fill="#FFFFFF" stroke="#000000" stroke-width="4" />
        <line x1="330" y1="580" x2="330" y2="670" stroke="#000000" stroke-width="8" />
        <line x1="970" y1="580" x2="970" y2="670" stroke="#000000" stroke-width="8" />
        
        <!-- Mug on table -->
        <rect x="420" y="440" width="40" height="50" rx="6" fill="#F87171" stroke="#000" stroke-width="3" />
        <!-- Man sitting behind table in jacket -->
        <circle cx="650" cy="300" r="50" fill="#FDBA74" />
        <path d="M570 350 L730 350 L750 450 L550 450 Z" fill="#1E3A8A" />
        <!-- Table sign banner -->
        <rect x="360" y="480" width="580" height="85" fill="#FAF9F5" stroke="#000000" stroke-width="3" />
        <text x="650" y="525" font-family="Space Grotesk, sans-serif" font-size="20" font-weight="bold" fill="#000000" text-anchor="middle">[YOUR CONTROVERSIAL STATEMENT HERE]</text>
        <text x="650" y="550" font-family="Space Mono, monospace" font-size="14" fill="#E11D48" font-weight="bold" text-anchor="middle">CHANGE MY MIND.</text>
      </svg>
    `),
  },
  {
    id: "disaster-girl",
    slug: "disaster-girl",
    index: "№ 0010",
    title: "DISASTER GIRL",
    categoryId: "01",
    categoryName: "Funny & Comedy",
    format: "classic",
    formatLabel: "Classic Photo",
    remixCount: 48900,
    downloadCount: 31800,
    createdAt: "2024-03-20",
    source: "Dave Roth (Visual Archive)",
    license: "Parody Archive",
    aspectRatio: "4:3",
    width: 800,
    height: 600,
    defaultTopText: "WHEN THE LEGACY MONOLITH FINALLY DIES",
    defaultBottomText: "AND YOU ARE THE ONLY ONE WHO COMMITTED",
    tags: ["disaster girl", "fire", "house on fire", "smile", "smirk", "chaos"],
    trendingRank: 10,
    svgDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <!-- Burning house in background -->
        <rect width="800" height="600" fill="#1C1917" />
        <polygon points="50,150 250,50 450,150 450,450 50,450" fill="#44403C" />
        <!-- Fire & flames -->
        <path d="M70 300 Q150 100 230 300 Q310 80 390 300 Q450 150 480 350 Z" fill="#F97316" opacity="0.9" />
        <path d="M120 320 Q200 150 280 320 Q340 180 400 320 Z" fill="#FACC15" opacity="0.9" />
        <!-- Girl's face in foreground right -->
        <ellipse cx="620" cy="380" rx="140" ry="160" fill="#FED7AA" />
        <path d="M490 280 Q620 180 750 280 Q760 450 740 500 L500 500 Z" fill="#78350F" />
        <!-- Mischievous knowing smirk -->
        <path d="M570 440 Q630 470 680 430" stroke="#78350F" stroke-width="5" fill="none" stroke-linecap="round" />
        <!-- Eyes looking back over shoulder -->
        <ellipse cx="580" cy="360" rx="12" ry="16" fill="#FFFFFF" />
        <circle cx="582" cy="360" r="7" fill="#000000" />
        <ellipse cx="660" cy="360" rx="12" ry="16" fill="#FFFFFF" />
        <circle cx="662" cy="360" r="7" fill="#000000" />
      </svg>
    `),
  },
  {
    id: "this-is-fine",
    slug: "this-is-fine",
    index: "№ 0011",
    title: "THIS IS FINE DOG",
    categoryId: "05",
    categoryName: "Relatable",
    format: "classic",
    formatLabel: "Illustrated Canon",
    remixCount: 68900,
    downloadCount: 46100,
    createdAt: "2024-03-25",
    source: "KC Green / Gunshow Comic",
    license: "Editorial Parody",
    aspectRatio: "16:9",
    width: 1200,
    height: 675,
    defaultTopText: "ALL SERVERS REPORTING CRITICAL STATUS",
    defaultBottomText: "THIS IS FINE.",
    tags: ["this is fine", "kc green", "dog", "fire", "coffee", "calm in chaos"],
    trendingRank: 11,
    svgDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
        <rect width="1200" height="675" fill="#78350F" />
        <!-- Room walls & floor -->
        <rect x="0" y="420" width="1200" height="255" fill="#451A03" />
        <!-- Raging flames all around -->
        <path d="M0,675 L0,200 Q150,50 300,280 Q450,20 600,220 Q750,50 900,250 Q1050,40 1200,200 L1200,675 Z" fill="#EA580C" />
        <path d="M0,675 L0,320 Q180,180 350,380 Q520,160 700,320 Q880,180 1050,340 L1200,675 Z" fill="#FACC15" />
        
        <!-- Table with coffee mug -->
        <polygon points="500,420 850,420 900,620 450,620" fill="#92400E" stroke="#000" stroke-width="4" />
        <rect x="700" y="460" width="50" height="55" rx="8" fill="#FFFFFF" stroke="#000" stroke-width="3" />
        <!-- Cartoon Dog sitting on chair -->
        <circle cx="480" cy="330" r="75" fill="#FCD34D" stroke="#000" stroke-width="5" />
        <!-- Little Hat -->
        <polygon points="450,260 510,260 480,210" fill="#1E3A8A" stroke="#000" stroke-width="3" />
        <rect x="430" y="258" width="100" height="10" fill="#1E3A8A" stroke="#000" stroke-width="2" />
        <!-- Peaceful vacant eyes -->
        <circle cx="455" cy="325" r="14" fill="#FFFFFF" stroke="#000" stroke-width="4" />
        <circle cx="455" cy="325" r="6" fill="#000" />
        <circle cx="505" cy="325" r="14" fill="#FFFFFF" stroke="#000" stroke-width="4" />
        <circle cx="505" cy="325" r="6" fill="#000" />
        <!-- Calm smile -->
        <path d="M460 365 Q480 380 500 365" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round" />
        <!-- Speech Bubble -->
        <polygon points="560,250 630,220 600,250" fill="#FFFFFF" stroke="#000" stroke-width="3" />
        <rect x="580" y="170" width="220" height="70" rx="10" fill="#FFFFFF" stroke="#000" stroke-width="4" />
        <text x="690" y="215" font-family="Space Grotesk, sans-serif" font-size="22" font-weight="900" fill="#000000" text-anchor="middle">THIS IS FINE.</text>
      </svg>
    `),
  },
  {
    id: "spider-man-pointing",
    slug: "spider-man-pointing",
    index: "№ 0012",
    title: "SPIDER-MAN POINTING",
    categoryId: "04",
    categoryName: "Gaming",
    format: "classic",
    formatLabel: "Parallel Double",
    remixCount: 63100,
    downloadCount: 41800,
    createdAt: "2024-04-01",
    source: "1967 Spider-Man Animated Series",
    license: "Parody Archive",
    aspectRatio: "4:3",
    width: 800,
    height: 600,
    defaultTopText: "YOU BROKE THE PRODUCTION PIPELINE",
    defaultBottomText: "NO, YOU MERGED WITHOUT TESTING",
    tags: ["spiderman", "pointing", "two", "identical", "blame", "accusation"],
    trendingRank: 12,
    svgDataUri: createSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
        <rect width="800" height="600" fill="#475569" />
        <polygon points="0,400 800,400 800,600 0,600" fill="#334155" />
        <!-- Left Spider-Man -->
        <g id="spiderman-left">
          <circle cx="250" cy="240" r="50" fill="#EF4444" stroke="#000" stroke-width="4" />
          <polygon points="230,230 250,220 255,235" fill="#FFFFFF" stroke="#000" stroke-width="2" />
          <polygon points="260,230 240,220 235,235" fill="#FFFFFF" stroke="#000" stroke-width="2" />
          <polygon points="180,290 320,290 340,520 160,520" fill="#1D4ED8" stroke="#000" stroke-width="4" />
          <rect x="230" y="290" width="60" height="230" fill="#EF4444" />
          <!-- Pointing Arm Right -->
          <line x1="300" y1="330" x2="430" y2="330" stroke="#EF4444" stroke-width="18" stroke-linecap="round" />
        </g>
        <!-- Right Spider-Man pointing Left -->
        <g id="spiderman-right">
          <circle cx="550" cy="240" r="50" fill="#EF4444" stroke="#000" stroke-width="4" />
          <polygon points="530,230 550,220 555,235" fill="#FFFFFF" stroke="#000" stroke-width="2" />
          <polygon points="560,230 540,220 535,235" fill="#FFFFFF" stroke="#000" stroke-width="2" />
          <polygon points="480,290 620,290 640,520 460,520" fill="#1D4ED8" stroke="#000" stroke-width="4" />
          <rect x="530" y="290" width="60" height="230" fill="#EF4444" />
          <!-- Pointing Arm Left -->
          <line x1="500" y1="330" x2="370" y2="330" stroke="#EF4444" stroke-width="18" stroke-linecap="round" />
        </g>
      </svg>
    `),
  },
];
