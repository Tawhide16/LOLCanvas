// Comprehensive Google Fonts Catalog & Dynamic Loader for LOLCanvas

export interface GoogleFontItem {
  name: string;
  category: "Meme Bold" | "Clean Sans" | "Monospace & Retro" | "Display & Fun" | "Handwriting & Marker" | "Vintage & Serif";
}

export const GOOGLE_FONTS_CATALOG: GoogleFontItem[] = [
  // 1. Meme Bold & Headlines
  { name: "Impact", category: "Meme Bold" },
  { name: "Anton", category: "Meme Bold" },
  { name: "Bebas Neue", category: "Meme Bold" },
  { name: "Oswald", category: "Meme Bold" },
  { name: "Roboto Condensed", category: "Meme Bold" },
  { name: "Alfa Slab One", category: "Meme Bold" },
  { name: "Black Ops One", category: "Meme Bold" },
  { name: "Ultra", category: "Meme Bold" },

  // 2. Clean Modern Sans
  { name: "Montserrat", category: "Clean Sans" },
  { name: "Poppins", category: "Clean Sans" },
  { name: "Inter", category: "Clean Sans" },
  { name: "Roboto", category: "Clean Sans" },
  { name: "Space Grotesk", category: "Clean Sans" },
  { name: "Work Sans", category: "Clean Sans" },
  { name: "Raleway", category: "Clean Sans" },
  { name: "Syne", category: "Clean Sans" },

  // 3. Monospace & Retro Gaming
  { name: "Space Mono", category: "Monospace & Retro" },
  { name: "Press Start 2P", category: "Monospace & Retro" },
  { name: "VT323", category: "Monospace & Retro" },
  { name: "Courier Prime", category: "Monospace & Retro" },
  { name: "Share Tech Mono", category: "Monospace & Retro" },
  { name: "Silkscreen", category: "Monospace & Retro" },

  // 4. Display, Comic & Meme Chaos
  { name: "Bangers", category: "Display & Fun" },
  { name: "Comic Neue", category: "Display & Fun" },
  { name: "Comic Sans MS", category: "Display & Fun" },
  { name: "Fredoka", category: "Display & Fun" },
  { name: "Righteous", category: "Display & Fun" },
  { name: "Creepster", category: "Display & Fun" },
  { name: "Rubik Glitch", category: "Display & Fun" },
  { name: "Bungee", category: "Display & Fun" },
  { name: "Shrikhand", category: "Display & Fun" },

  // 5. Handwriting & Marker
  { name: "Permanent Marker", category: "Handwriting & Marker" },
  { name: "Caveat", category: "Handwriting & Marker" },
  { name: "Pacifico", category: "Handwriting & Marker" },
  { name: "Lobster", category: "Handwriting & Marker" },
  { name: "Kalam", category: "Handwriting & Marker" },
  { name: "Gloria Hallelujah", category: "Handwriting & Marker" },

  // 6. Vintage & Elegant Serif
  { name: "Playfair Display", category: "Vintage & Serif" },
  { name: "Cinzel", category: "Vintage & Serif" },
  { name: "Abril Fatface", category: "Vintage & Serif" },
  { name: "Special Elite", category: "Vintage & Serif" },
  { name: "DM Serif Display", category: "Vintage & Serif" },
];

/**
 * Dynamically injects Google Font link tag and requests browser to load font face
 */
export function loadGoogleFont(fontName: string, onLoaded?: () => void) {
  if (typeof document === "undefined" || !fontName) return;

  const systemFonts = [
    "Impact",
    "Arial",
    "Arial Black",
    "Comic Sans MS",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Verdana",
  ];

  if (systemFonts.includes(fontName)) {
    onLoaded?.();
    return;
  }

  const cleanId = `gfont-${fontName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;
  if (!document.getElementById(cleanId)) {
    const link = document.createElement("link");
    link.id = cleanId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      fontName.trim()
    )}:wght@400;700;900&display=swap`;
    link.onload = () => {
      if (document.fonts) {
        document.fonts.load(`16px "${fontName}"`).then(() => {
          onLoaded?.();
        }).catch(() => {});
      } else {
        onLoaded?.();
      }
    };
    document.head.appendChild(link);
  } else {
    if (document.fonts) {
      document.fonts.load(`16px "${fontName}"`).then(() => {
        onLoaded?.();
      }).catch(() => {});
    }
  }
}
