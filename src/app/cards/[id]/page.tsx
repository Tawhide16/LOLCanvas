import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Download, Wand2, Shield, Tag, AlertCircle } from "lucide-react";
import { TEMPLATES } from "@/lib/data";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const template = TEMPLATES.find((t) => t.slug === id || t.id === id);

  if (!template) {
    return {
      title: "Meme Template Not Found — LOLCanvas",
    };
  }

  const title = `${template.title} Meme Template (Watermark-Free) — LOLCanvas`;
  const description = `Create and customize ${template.title} memes online for free. Clean vector canvas editor, custom text formatting, and instant high-res PNG export with zero forced stamps.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://lol-canvas.vercel.app/cards/${template.slug}`,
      images: [
        {
          url: template.svgDataUri,
          width: template.width,
          height: template.height,
          alt: `${template.title} meme format preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [template.svgDataUri],
    },
  };
}

export default async function CardTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const template = TEMPLATES.find((t) => t.slug === id || t.id === id);

  if (!template) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: template.title,
    caption: `Meme format template for ${template.title}`,
    contentUrl: `https://lol-canvas.vercel.app/cards/${template.slug}`,
    thumbnailUrl: template.svgDataUri,
    width: template.width,
    height: template.height,
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
    creator: {
      "@type": "Organization",
      name: "LOLCanvas Archive Project",
    },
  };

  return (
    <div className="flex flex-col w-full bg-[#FAF9F5] min-h-screen">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Breadcrumb Header */}
      <div className="px-6 py-3 border-b border-black bg-white flex items-center justify-between font-mono-code text-xs">
        <Link
          href="/cards"
          className="inline-flex items-center gap-1.5 hover:underline font-bold text-black"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO TEMPLATE ARCHIVE</span>
        </Link>
        <span className="text-[#888888]">{template.index}</span>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-black border-b border-black bg-[#FAF9F5]">
        {/* Left Side: Large Visual Template Display */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col items-center justify-center bg-[#F6F5EE]">
          <div className="w-full max-w-lg border-2 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="p-2 border-b border-black bg-[#E6E4DC] flex items-center justify-between font-mono-code text-[10px]">
              <span className="font-bold">{template.aspectRatio} CANVAS</span>
              <span className="text-[#047857] font-semibold">100% WATERMARK-FREE</span>
            </div>
            {/* Template Visual Preview with Alt Text */}
            <div className="w-full aspect-square sm:aspect-auto flex items-center justify-center p-4 bg-white">
              <img
                src={template.svgDataUri}
                alt={`${template.title} clean meme template graphic`}
                className="max-h-[460px] w-auto object-contain mx-auto border border-black/15 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Meta Details & 1-Click Launch CTA */}
        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6 bg-[#FAF9F5]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#E11D48] text-white font-mono-code text-[10px] font-bold uppercase">
                {template.categoryName}
              </span>
              <span className="px-2 py-0.5 bg-[#E6E4DC] border border-black font-mono-code text-[10px] font-bold text-black uppercase">
                {template.formatLabel}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-black leading-tight">
              {template.title}
            </h1>

            <p className="font-body text-sm text-[#555555] leading-relaxed">
              Standardized editorial meme canvas format. Open in the in-browser studio to customize text layers, adjust fonts, add stickers, and export watermark-free high-resolution PNGs.
            </p>

            {/* Launch Primary Action CTA */}
            <div className="pt-2">
              <Link
                href={`/edit/${template.slug}`}
                className="w-full py-4 px-6 bg-black text-white hover:bg-[#222222] font-mono-code text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_rgba(225,29,72,1)] hover:translate-y-[-1px] active:translate-y-[1px]"
              >
                <span>OPEN IN CANVAS STUDIO</span>
                <Wand2 className="w-4 h-4 text-[#E11D48]" />
              </Link>
            </div>
          </div>

          {/* Specifications Matrix */}
          <div className="border border-black bg-white divide-y divide-black font-mono-code text-xs">
            <div className="p-3 flex items-center justify-between">
              <span className="text-[#777777] text-[11px] uppercase">NATIVE RESOLUTION</span>
              <span className="font-bold text-black">{template.width} × {template.height} PX</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-[#777777] text-[11px] uppercase">LICENSE TYPE</span>
              <span className="font-bold text-black">{template.license}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-[#777777] text-[11px] uppercase">INDEX CATALOG NUMBER</span>
              <span className="font-bold text-[#E11D48]">{template.index}</span>
            </div>
          </div>

          {/* Tags Cloud */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono-code uppercase text-[#777777] block">
              TAGS & TOPICS:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-[#E6E4DC] border border-black/30 font-mono-code text-[10px] text-[#333333]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Moderation / DMCA Link */}
          <div className="pt-4 border-t border-black/15 flex items-center justify-between text-[11px] font-mono-code text-[#777777]">
            <span className="inline-flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#10B981]" />
              VERIFIED NO WATERMARKS
            </span>
            <Link
              href="/contact"
              className="text-[#E11D48] hover:underline inline-flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              REPORT THIS FORMAT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
