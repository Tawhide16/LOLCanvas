import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/data";

export default function CollectionSection() {
  return (
    <section className="w-full border-b border-black bg-[#FAF9F5]">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-black px-4 sm:px-6 py-2.5 bg-[#FAF9F5]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 bg-black"></div>
          <h2 className="font-display font-extrabold text-xs sm:text-sm tracking-wider uppercase text-black">
            CATEGORIES // 01–08
          </h2>
        </div>
        <Link
          href="/collection"
          className="font-mono-code text-xs text-black hover:underline uppercase flex items-center gap-1"
        >
          ALL CATEGORIES <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 8 Clean Numbered Cells */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-x divide-y lg:divide-y-0 divide-black bg-white">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/cards?category=${cat.id}`}
            className="group p-4 bg-white hover:bg-[#F6F5EE] transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between font-mono-code text-[11px]">
              <span className="font-bold text-[#E11D48]">[{cat.number}]</span>
              <span className="text-[#888888] text-[10px]">{(cat.count / 1000).toFixed(1)}K</span>
            </div>

            <h3 className="font-display font-bold text-xs uppercase text-black group-hover:text-[#E11D48] transition-colors leading-tight">
              {cat.name}
            </h3>

            <div className="font-mono-code text-[11px] text-[#888888] group-hover:text-black group-hover:translate-x-1 transition-all">
              →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
