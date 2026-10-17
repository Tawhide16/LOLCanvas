import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono, Inter } from "next/font/google";
import "./globals.css";
import OuterMetadata from "@/components/layout/OuterMetadata";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import HydrationFix from "@/components/layout/HydrationFix";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "LOLCanvas® — Memes That Make Noise | Studio & Archive",
  description:
    "An editorial, watermark-free meme template archive and in-browser canvas editor built around a Swiss architectural grid and modern neo-brutalist visual language.",
  keywords: [
    "meme generator",
    "watermark-free",
    "meme templates",
    "canvas editor",
    "neo-brutalist design",
    "open archive",
  ],
  icons: {
    icon: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${spaceMono.variable} ${inter.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                // 1. Prevent bis_skin_checked hydration mismatch
                var o = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function(n, v) {
                  if (n === 'bis_skin_checked' || (typeof n === 'string' && n.indexOf('bis_') === 0)) return;
                  return o.apply(this, arguments);
                };

                // 2. Early capture to block Chrome extensions (e.g. M_ID in 200.js) from triggering Next.js overlay
                window.addEventListener('error', function(e) {
                  var fn = e.filename || '';
                  var st = (e.error && e.error.stack) ? e.error.stack : '';
                  var msg = e.message || '';
                  var combo = fn + ' ' + st + ' ' + msg;
                  if (
                    combo.indexOf('chrome-extension://') !== -1 ||
                    combo.indexOf('moz-extension://') !== -1 ||
                    combo.indexOf('safari-extension://') !== -1 ||
                    combo.indexOf('M_ID') !== -1 ||
                    combo.indexOf('bis_skin_checked') !== -1 ||
                    combo.indexOf('executors/200.js') !== -1
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(e) {
                  var r = e.reason;
                  var st = (r && r.stack) ? r.stack : '';
                  var msg = (r && r.message) ? r.message : String(r || '');
                  var combo = st + ' ' + msg;
                  if (
                    combo.indexOf('chrome-extension://') !== -1 ||
                    combo.indexOf('moz-extension://') !== -1 ||
                    combo.indexOf('M_ID') !== -1 ||
                    combo.indexOf('executors/200.js') !== -1
                  ) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              } catch(err) {}
            })();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#E6E4DC] text-black font-body selection:bg-black selection:text-white antialiased"
      >
        <HydrationFix />
        {/* Outer Frame with desktop insets: p-2 sm:p-5 md:p-8 */}
        <div suppressHydrationWarning className="min-h-screen p-2 sm:p-5 md:p-8 flex flex-col justify-between">
          <div suppressHydrationWarning className="w-full max-w-[1540px] mx-auto flex flex-col flex-1 bg-[#FAF9F5] border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Top Outer Metadata Row */}
            <OuterMetadata position="top" />

            {/* Main Connected Navbar */}
            <Navbar />

            {/* Page Content with smooth transitions */}
            <main className="flex-1 w-full bg-[#FAF9F5] flex flex-col">
              <PageTransition>{children}</PageTransition>
            </main>

            {/* Bottom Footer */}
            <Footer />

            {/* Bottom Outer Metadata Row */}
            <OuterMetadata position="bottom" />
          </div>
        </div>
      </body>
    </html>
  );
}

