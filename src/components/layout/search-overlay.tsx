"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { SearchIcon, CloseIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

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

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
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
      if (res.ok) {
        setResults(await res.json());
      }
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
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-roots-cream transition-opacity duration-200 hover:opacity-80"
        aria-label="Search"
      >
        <SearchIcon />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-roots-navy/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Search panel */}
          <div
            className="relative z-10 w-full max-w-2xl mx-4"
            style={{ animation: "searchSlideIn 200ms ease-out" }}
          >
            {/* Input */}
            <div className="relative">
              <SearchIcon
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-roots-green/40"
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search products, collections, articles..."
                className="h-[60px] w-full rounded-t-[16px] border-0 bg-white pl-14 pr-14 text-base text-roots-navy placeholder:text-roots-navy/40 focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={close}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-roots-navy/40 hover:text-roots-navy transition-colors"
                aria-label="Close search"
              >
                <CloseIcon size={18} />
              </button>
              {/* Keyboard hint */}
              <span className="absolute right-12 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded border border-roots-green/10 px-1.5 py-0.5 text-[10px] text-roots-navy/30">
                ESC
              </span>
            </div>

            {/* Results */}
            {(hasResults || noResults || loading) && (
              <div className="max-h-[60vh] overflow-y-auto rounded-b-[16px] bg-white border-t border-roots-green/10 shadow-xl">
                {loading && !results && (
                  <div className="px-6 py-8 text-center text-sm text-roots-navy/40">
                    Searching...
                  </div>
                )}

                {noResults && (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-roots-navy/50">
                      No results for &ldquo;{query}&rdquo;
                    </p>
                    <p className="mt-1 text-xs text-roots-navy/30">
                      Try a different search term
                    </p>
                  </div>
                )}

                {/* Products */}
                {results && results.products.length > 0 && (
                  <div className="px-4 pt-4 pb-2">
                    <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-roots-green/40">
                      Products
                    </p>
                    {results.products.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/products/${p.slug}`}
                        onClick={close}
                        className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-roots-cream/50"
                      >
                        {p.imageUrl ? (
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-roots-cream-2">
                            <img
                              src={p.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-roots-cream-2" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-roots-navy">
                            {p.name}
                          </p>
                          {p.price !== null && (
                            <p className="text-xs text-roots-green">
                              {p.type === "pom" ? "From " : ""}
                              {formatPrice(p.price)}
                            </p>
                          )}
                        </div>
                        {p.type === "pom" && (
                          <span className="flex-shrink-0 rounded-full bg-roots-navy px-2 py-0.5 text-[10px] font-medium text-roots-orange">
                            Prescription
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Collections */}
                {results && results.collections.length > 0 && (
                  <div className="px-4 pt-3 pb-2">
                    <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-roots-green/40">
                      Collections
                    </p>
                    {results.collections.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/collections/${c.slug}`}
                        onClick={close}
                        className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-roots-cream/50"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-roots-green/5">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 text-roots-green/50"
                          >
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-roots-navy">
                            {c.name}
                          </p>
                          {c.description && (
                            <p className="truncate text-xs text-roots-navy/50">
                              {c.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Blog posts */}
                {results && results.posts.length > 0 && (
                  <div className="px-4 pt-3 pb-4">
                    <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-roots-green/40">
                      Articles
                    </p>
                    {results.posts.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/blog/${p.slug}`}
                        onClick={close}
                        className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-roots-cream/50"
                      >
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-roots-green/5">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5 text-roots-green/50"
                          >
                            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                            <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-roots-navy">
                            {p.title}
                          </p>
                          <p className="truncate text-xs text-roots-navy/50">
                            {p.category}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty state hint when no query */}
            {!results && !loading && query.length === 0 && (
              <div className="rounded-b-[16px] bg-white border-t border-roots-green/10 shadow-xl px-6 py-6">
                <p className="text-center text-sm text-roots-navy/40">
                  Search for products, health topics, or articles
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {["Mounjaro", "Vitamins", "Sleep", "Joint Support", "Acne"].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleChange(tag)}
                        className="rounded-full border border-roots-green/15 bg-roots-cream/50 px-3.5 py-1.5 text-xs font-medium text-roots-green transition-colors hover:bg-roots-green/5"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
