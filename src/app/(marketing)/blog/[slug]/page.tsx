import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getAllBlogPosts } from "@/data/blog-posts";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog Post" };

  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    openGraph: {
      title: `${post.title} | Roots Pharmacy`,
      description: post.metaDescription,
      url: `https://rootspharmacy.co.uk/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      ...(post.updatedAt && { modifiedTime: post.updatedAt }),
      authors: ["Roots Pharmacy"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
    },
    alternates: {
      canonical: `https://rootspharmacy.co.uk/blog/${slug}`,
    },
  };
}

/** Simple markdown-to-HTML for blog content (handles ##, ###, **, |tables|, -lists, numbered lists). */
function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Table
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      // Filter out separator line
      const dataLines = tableLines.filter((l) => !l.match(/^\|\s*-+/));
      if (dataLines.length > 0) {
        const headers = dataLines[0]
          .split("|")
          .filter(Boolean)
          .map((c) => c.trim());
        const rows = dataLines.slice(1).map((row) =>
          row
            .split("|")
            .filter(Boolean)
            .map((c) => c.trim())
        );
        elements.push(
          <div key={i} className="my-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-roots-green/20">
                  {headers.map((h, hi) => (
                    <th
                      key={hi}
                      className="px-3 py-2 text-left font-medium text-roots-green"
                      dangerouslySetInnerHTML={{ __html: inlineFormat(h) }}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-roots-green/10">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-3 py-2 text-roots-green/80"
                        dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Heading
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="mb-3 mt-8 text-lg font-medium text-roots-green"
        >
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="mb-4 mt-10 text-2xl font-medium text-roots-green"
        >
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // Unordered list
    if (line.trimStart().startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("- ")) {
        items.push(lines[i].trimStart().slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="my-4 list-disc space-y-1.5 pl-6 text-roots-green/80">
          {items.map((item, ii) => (
            <li
              key={ii}
              dangerouslySetInnerHTML={{ __html: inlineFormat(item) }}
            />
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line.trimStart())) {
      const items: string[] = [];
      while (
        i < lines.length &&
        /^\d+\.\s/.test(lines[i].trimStart())
      ) {
        items.push(lines[i].trimStart().replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="my-4 list-decimal space-y-1.5 pl-6 text-roots-green/80">
          {items.map((item, ii) => (
            <li
              key={ii}
              dangerouslySetInnerHTML={{ __html: inlineFormat(item) }}
            />
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph
    elements.push(
      <p
        key={i}
        className="my-4 leading-relaxed text-roots-green/80"
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
      />
    );
    i++;
  }

  return elements;
}

/** Format inline markdown: **bold**, [links](url) */
function inlineFormat(text: string): string {
  return text
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-medium text-roots-green">$1</strong>'
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="underline hover:text-roots-green" target="_blank" rel="noopener noreferrer">$1</a>'
    );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  return (
    <div className="bg-roots-cream">
      <ArticleJsonLd
        title={post.title}
        description={post.metaDescription}
        slug={post.slug}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title },
        ]}
      />

      <div className="page-container py-16 md:py-20">
        {/* Breadcrumb */}
        <nav
          className="mb-8 flex items-center gap-2 text-sm text-roots-green/60"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-roots-green">
            Home
          </Link>
          <span aria-hidden="true">&gt;</span>
          <Link href="/blog" className="hover:text-roots-green">
            Blog
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span className="text-roots-green">{post.category}</span>
        </nav>

        <article className="mx-auto max-w-3xl">
          <header className="mb-10">
            <span className="mb-4 inline-block rounded-full bg-roots-green/10 px-3 py-1 text-xs font-medium text-roots-green">
              {post.category}
            </span>
            <h1 className="text-[32px] font-medium leading-tight text-roots-green md:text-[42px]">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-roots-green/50">
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              <span>Roots Pharmacy</span>
            </div>
          </header>

          <div className="prose-roots">{renderContent(post.content)}</div>

          {/* CTA */}
          <div className="mt-16 rounded-2xl bg-roots-green p-8 text-center text-roots-cream md:p-12">
            <h2 className="text-2xl font-medium md:text-3xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-roots-cream/70">
              Browse our range of pharmacy products and supplements, or start a
              free consultation for Mounjaro.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/collections/vitamins-supplements"
                className="rounded-full bg-roots-cream px-6 py-3 text-sm font-medium text-roots-green transition-opacity hover:opacity-90"
              >
                Shop Supplements
              </Link>
              <Link
                href="/consultations/mounjaro"
                className="rounded-full border border-roots-cream/30 px-6 py-3 text-sm font-medium text-roots-cream transition-opacity hover:opacity-80"
              >
                Start Consultation
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
