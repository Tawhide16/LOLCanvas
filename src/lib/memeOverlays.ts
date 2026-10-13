// Preset iconic meme overlay graphics (encoded SVGs for instant, zero-latency rendering)
function svgUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export interface MemeOverlayItem {
  id: string;
  name: string;
  category: "glasses" | "headwear" | "faces" | "effects";
  imageUrl: string;
  defaultWidth: number;
  defaultHeight: number;
}

export const MEME_OVERLAYS: MemeOverlayItem[] = [
  {
    id: "thug-shades",
    name: "Thug Life Sunglasses",
    category: "glasses",
    defaultWidth: 260,
    defaultHeight: 60,
    imageUrl: svgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 60" width="260" height="60">
        <!-- Pixel Sunglasses -->
        <g fill="#000000">
          <!-- Bridge -->
          <rect x="110" y="20" width="40" height="10" />
          <!-- Left Lens -->
          <polygon points="10,10 110,10 110,40 100,50 30,50 10,30" />
          <!-- Right Lens -->
          <polygon points="150,10 250,10 250,30 230,50 160,50 150,40" />
        </g>
        <!-- Lens Glare Highlights -->
        <g fill="#FFFFFF">
          <rect x="25" y="15" width="10" height="10" />
          <rect x="35" y="25" width="10" height="10" />
          <rect x="165" y="15" width="10" height="10" />
          <rect x="175" y="25" width="10" height="10" />
        </g>
      </svg>
    `),
  },
  {
    id: "deal-with-it",
    name: "Deal With It 8-Bit Shades",
    category: "glasses",
    defaultWidth: 240,
    defaultHeight: 50,
    imageUrl: svgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 50" width="240" height="50">
        <rect x="0" y="10" width="240" height="12" fill="#000" />
        <rect x="10" y="22" width="100" height="24" fill="#000" />
        <rect x="130" y="22" width="100" height="24" fill="#000" />
        <!-- White pixels -->
        <rect x="20" y="24" width="8" height="8" fill="#FFF" />
        <rect x="28" y="32" width="8" height="8" fill="#FFF" />
        <rect x="140" y="24" width="8" height="8" fill="#FFF" />
        <rect x="148" y="32" width="8" height="8" fill="#FFF" />
      </svg>
    `),
  },
  {
    id: "red-laser-eyes",
    name: "Red Laser Glowing Eyes",
    category: "effects",
    defaultWidth: 220,
    defaultHeight: 80,
    imageUrl: svgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80" width="220" height="80">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="25%" stop-color="#FF0033" />
            <stop offset="70%" stop-color="#FF0000" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#FF0000" stop-opacity="0" />
          </radialGradient>
        </defs>
        <!-- Left eye flare -->
        <ellipse cx="60" cy="40" rx="45" ry="35" fill="url(#glow)" />
        <polygon points="60,40 -20,20 -10,60" fill="#FF0033" opacity="0.6" />
        <circle cx="60" cy="40" r="10" fill="#FFFFFF" />
        <!-- Right eye flare -->
        <ellipse cx="160" cy="40" rx="45" ry="35" fill="url(#glow)" />
        <polygon points="160,40 240,20 230,60" fill="#FF0033" opacity="0.6" />
        <circle cx="160" cy="40" r="10" fill="#FFFFFF" />
      </svg>
    `),
  },
  {
    id: "doge-head",
    name: "Shiba Doge Head",
    category: "faces",
    defaultWidth: 180,
    defaultHeight: 180,
    imageUrl: svgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
        <!-- Doge Head -->
        <circle cx="90" cy="90" r="75" fill="#E6BA80" stroke="#8C5329" stroke-width="4" />
        <polygon points="40,40 25,10 65,25" fill="#D4A373" stroke="#8C5329" stroke-width="3" />
        <polygon points="140,40 155,10 115,25" fill="#D4A373" stroke="#8C5329" stroke-width="3" />
        <!-- Muzzle -->
        <ellipse cx="90" cy="115" rx="42" ry="32" fill="#F8F4EE" />
        <ellipse cx="90" cy="100" rx="14" ry="9" fill="#1A1A1A" />
        <!-- Eyes -->
        <ellipse cx="65" cy="80" rx="12" ry="9" fill="#FFFFFF" stroke="#8C5329" stroke-width="2" />
        <circle cx="67" cy="80" r="6" fill="#1A1A1A" />
        <ellipse cx="115" cy="80" rx="12" ry="9" fill="#FFFFFF" stroke="#8C5329" stroke-width="2" />
        <circle cx="113" cy="80" r="6" fill="#1A1A1A" />
        <!-- Eyebrows -->
        <path d="M55 65 Q65 60 75 66" stroke="#8C5329" stroke-width="3" fill="none" />
        <path d="M105 66 Q115 60 125 65" stroke="#8C5329" stroke-width="3" fill="none" />
      </svg>
    `),
  },
  {
    id: "scumbag-hat",
    name: "Scumbag Steve Brown Hat",
    category: "headwear",
    defaultWidth: 200,
    defaultHeight: 120,
    imageUrl: svgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" width="200" height="120">
        <!-- Brown Plaid Snapback -->
        <ellipse cx="100" cy="70" rx="80" ry="38" fill="#8B5A2B" stroke="#000" stroke-width="4" />
        <path d="M20 70 Q100 20 180 70 Z" fill="#A0522D" stroke="#000" stroke-width="4" />
        <!-- Plaid lines -->
        <line x1="60" y1="35" x2="60" y2="70" stroke="#D2B48C" stroke-width="4" />
        <line x1="100" y1="20" x2="100" y2="70" stroke="#D2B48C" stroke-width="4" />
        <line x1="140" y1="35" x2="140" y2="70" stroke="#D2B48C" stroke-width="4" />
        <!-- Brim turned sideways -->
        <ellipse cx="140" cy="78" rx="50" ry="18" fill="#5C3317" stroke="#000" stroke-width="4" />
      </svg>
    `),
  },
  {
    id: "speech-bubble",
    name: "Comic Speech Bubble",
    category: "effects",
    defaultWidth: 220,
    defaultHeight: 150,
    imageUrl: svgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 150" width="220" height="150">
        <rect x="10" y="10" width="200" height="100" rx="20" fill="#FFFFFF" stroke="#000000" stroke-width="6" />
        <polygon points="40,110 30,145 70,110" fill="#FFFFFF" />
        <polyline points="40,108 30,145 70,108" stroke="#000000" stroke-width="6" fill="none" stroke-linejoin="round" />
      </svg>
    `),
  },
  {
    id: "fire-flame",
    name: "Fire Emoji Flame",
    category: "effects",
    defaultWidth: 140,
    defaultHeight: 180,
    imageUrl: svgUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 180" width="140" height="180">
        <path d="M70,10 Q120,70 110,130 Q100,180 70,175 Q40,180 30,130 Q20,70 70,10 Z" fill="#EA580C" />
        <path d="M70,50 Q100,90 95,140 Q85,170 70,165 Q55,170 45,140 Q40,90 70,50 Z" fill="#FACC15" />
        <path d="M70,90 Q85,120 80,150 Q75,165 70,162 Q65,165 60,150 Q55,120 70,90 Z" fill="#FFFFFF" />
      </svg>
    `),
  },
];
