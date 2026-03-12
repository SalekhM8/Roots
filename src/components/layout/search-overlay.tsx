"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { SearchIcon, CloseIcon } from "@/components/icons";

interface SearchResult {
  products: {
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    type: string;
    price: number | null;
  }[];
  collections: {
    name: string;
    slug: string;
    description: string | null;
  }[];
  posts: {
    title: string;
    slug: string;
    excerpt: string;
    category: string;
  }[];
}

function formatPrice(minor: number) {
  return `£${(minor / 100).toFixed(2)}`;
}

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults(null);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const search = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (res.ok) setResults(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 250);
  }

  function close() {
    setOpen(false);
  }

  const hasResults =
    results &&
    (results.products.length > 0 ||
      results.collections.length > 0 ||
      results.posts.length > 0);
  const noResults = results && !hasResults && query.trim().length >= 2;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-roots-cream transition-opacity duration-200 hover:opacity-80"
        aria-label="Search"
      >
        <SearchIcon />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]">
          {/* Full-screen dark green panel */}
          <div
            className="absolute inset-0 bg-roots-green"
            style={{ animation: "searchFadeIn 200ms ease-out" }}
          >
            {/* SVG decorative background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <svg viewBox="0 0 1440 900" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice" stroke="#fdf0d5" strokeLinecap="round" strokeLinejoin="round">
                <g transform="translate(100, 100) scale(3)" opacity="0.06" strokeWidth="0.7">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </g>
                <g transform="translate(1200, 150) scale(2.5)" opacity="0.05" strokeWidth="0.7">
                  <path d="M12.5 24.5l12-12a5.66 5.66 0 1 0-8-8l-12 12a5.66 5.66 0 1 0 8 8Z" />
                </g>
                <g transform="translate(200, 600) scale(2.5)" opacity="0.05" strokeWidth="0.7">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </g>
                <g transform="translate(1100, 650) scale(2)" opacity="0.04" strokeWidth="0.7">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                </g>
                <circle cx="700" cy="400" r="180" opacity="0.03" strokeWidth="1" />
                <circle cx="400" cy="200" r="4" opacity="0.06" strokeWidth="1.3" />
                <circle cx="1050" cy="750" r="5" opacity="0.05" strokeWidth="1.3" />
              </svg>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={close}
              className="absolute right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-roots-cream/20 text-roots-cream/60 transition-colors hover:bg-roots-cream/10 hover:text-roots-cream"
              aria-label="Close search"
            >
              <CloseIcon size={20} />
            </button>

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col items-center px-6 pt-[12vh]">
              <p className="mb-6 text-sm font-medium uppercase tracking-widest text-roots-cream/40">
                Search
              </p>

              {/* Input */}
              <div className="relative w-full max-w-xl">
                <SearchIcon
                  size={22}
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-roots-cream/30"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full border-0 border-b-2 border-roots-cream/20 bg-transparent pb-4 pl-10 pr-4 text-2xl font-medium text-roots-cream placeholder:text-roots-cream/25 focus:border-roots-cream/40 focus:outline-none focus:ring-0 md:text-3xl"
                />
              </div>

              {/* Quick tags */}
              {!results && !loading && query.length === 0 && (
                <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                  {["Mounjaro", "Vitamins", "Sleep", "Digestion", "Joint Support", "Skin Care"].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleChange(tag)}
                        className="rounded-full border border-roots-cream/15 px-5 py-2 text-sm font-medium text-roots-cream/60 transition-all duration-200 hover:border-roots-cream/30 hover:bg-roots-cream/5 hover:text-roots-cream"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              )}

              {/* Loading */}
              {loading && !results && (
                <p className="mt-12 text-sm text-roots-cream/30">Searching...</p>
              )}

              {/* No results */}
              {noResults && (
                <div className="mt-12 text-center">
                  <p className="text-lg text-roots-cream/50">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                  <p className="mt-2 text-sm text-roots-cream/25">
                    Try a different search term
                  </p>
                </div>
              )}

              {/* Results */}
              {hasResults && (
                <div className="mt-10 w-full max-w-3xl overflow-y-auto pb-20" style={{ maxHeight: "60vh" }}>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Products column */}
                    {results!.products.length > 0 && (
                      <div>
                        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-roots-cream/30">
                          Products
                        </p>
                        <div className="space-y-1">
                          {results!.products.map((p) => (
                            <Link
                              key={p.slug}
                              href={`/products/${p.slug}`}
                              onClick={close}
                              className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-roots-cream/5"
                            >
                              {p.imageUrl ? (
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-roots-green-2/50">
                                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                                </div>
                              ) : (
                                <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-roots-green-2/50" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-base font-medium text-roots-cream">
                                  {p.name}
                                </p>
                                <p className="text-sm text-roots-cream/40">
                                  {p.price !== null
                                    ? `${p.type === "pom" ? "From " : ""}${formatPrice(p.price)}`
                                    : "View product"}
                                </p>
                              </div>
                              {p.type === "pom" && (
                                <span className="flex-shrink-0 rounded-full bg-roots-orange/15 px-2.5 py-1 text-[11px] font-medium text-roots-orange">
                                  Prescription
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Collections + Articles column */}
                    <div className="space-y-8">
                      {results!.collections.length > 0 && (
                        <div>
                          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-roots-cream/30">
                            Collections
                          </p>
                          <div className="space-y-1">
                            {results!.collections.map((c) => (
                              <Link
                                key={c.slug}
                                href={`/collections/${c.slug}`}
                                onClick={close}
                                className="block rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-roots-cream/5"
                              >
                                <p className="text-base font-medium text-roots-cream">
                                  {c.name}
                                </p>
                                {c.description && (
                                  <p className="mt-0.5 truncate text-sm text-roots-cream/35">
                                    {c.description}
                                  </p>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {results!.posts.length > 0 && (
                        <div>
                          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-roots-cream/30">
                            Articles
                          </p>
                          <div className="space-y-1">
                            {results!.posts.map((p) => (
                              <Link
                                key={p.slug}
                                href={`/blog/${p.slug}`}
                                onClick={close}
                                className="block rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-roots-cream/5"
                              >
                                <p className="text-base font-medium text-roots-cream">
                                  {p.title}
                                </p>
                                <p className="mt-0.5 text-sm text-roots-cream/35">
                                  {p.category}
                                </p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
