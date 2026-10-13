import Link from "next/link";
import { ArrowUpRight, FolderGit2 } from "lucide-react";
import { CATEGORIES, TEMPLATES } from "@/lib/data";

export default function CollectionPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-black bg-[#FAF9F5] flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono-code uppercase font-semibold text-[#777777]">
            <FolderGit2 className="w-3 h-3 text-black" />
            CATEGORIES (01–08)
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-black">
            CATEGORY INDEX.
          </h1>
        </div>

        <span className="font-mono-code text-xs text-[#555555] hidden sm:inline">
          8 CURATED TAXONOMIES
        </span>
      </div>

      {/* Categories Grid */}
      <div className="divide-y divide-black bg-[#FAF9F5]">
        {CATEGORIES.map((cat) => {
          const categoryTemplates = TEMPLATES.filter((t) => t.categoryId === cat.id);

          return (
            <div key={cat.id} className="p-6 sm:p-8 bg-white hover:bg-[#FAF9F5] transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Category Info */}
                <div className="space-y-2 max-w-md">
                  <div className="flex items-center gap-2 font-mono-code text-xs">
                    <span className="px-1.5 py-0.5 bg-black text-white font-bold text-[10px]">
                      [{cat.number}]
                    </span>
                    <span className="text-[#777777] uppercase text-[11px]">
                      {cat.count.toLocaleString()} ITEMS
                    </span>
                  </div>

                  <h2 className="font-display font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-black">
                    {cat.name}
                  </h2>

                  <p className="font-body text-xs text-[#666666]">
                    {cat.description}
                  </p>

                  <Link
                    href={`/cards?category=${cat.id}`}
                    className="inline-flex items-center gap-1.5 font-mono-code text-xs font-bold text-black hover:underline uppercase pt-1"
                  >
                    VIEW ARCHIVE <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Sample Previews */}
                <div className="flex-1 max-w-xl">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {categoryTemplates.slice(0, 3).map((item) => (
                      <Link
                        key={item.id}
                        href={`/edit/${item.slug}`}
                        className="group border border-black bg-[#FAF9F5] hover:bg-white p-2 flex flex-col justify-between transition-all hover:translate-y-[-1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="aspect-[4/3] bg-white border border-black/15 p-1.5 flex items-center justify-center mb-1.5 overflow-hidden">
                          <img
                            src={item.svgDataUri}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="font-display font-bold text-[11px] uppercase text-black truncate group-hover:text-[#E11D48]">
                          {item.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
