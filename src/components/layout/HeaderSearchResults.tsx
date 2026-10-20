import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { conciseTitle, formatMoney, minPrice, productImage } from "@/lib/formatters";
import { useCollectionPreviewProducts, usePredictiveSearch } from "@/lib/live-product-listings";
import type { ShopifyProduct } from "@/types/shopify";

const DEFAULT_TRENDING_SEARCHES = ["Perfume", "Shoes", "Kids", "Men shirts", "Women"];
const POPULAR_PRODUCTS_COLLECTION = "best-sellers";

type HeaderSearchResultsProps = {
  query: string;
  recentSearches: string[];
  onClose: () => void;
  onSearchAll: () => void;
  onQuickSearch: (query: string) => void;
};

function normalizeSearchPhrase(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const SEARCH_DEBOUNCE_MS = 180;

// Boosts strong title matches to the top. Shopify predictive search already
// matched every result (including descriptions, tags, synonyms and typo
// tolerance), so this only reorders and never drops a result.
function scoreQuickSearchProduct(
  product: ShopifyProduct,
  normalizedQuery: string,
  queryTokens: string[],
): number {
  const title = normalizeSearchPhrase(product.title);
  const type = normalizeSearchPhrase(product.product_type || "");
  const tags = Array.isArray(product.tags)
    ? normalizeSearchPhrase(product.tags.join(" "))
    : normalizeSearchPhrase(String(product.tags || ""));
  const haystack = `${title} ${type} ${tags}`;

  let score = queryTokens.filter((token) => haystack.includes(token)).length * 10;
  if (title === normalizedQuery) {
    score += 100;
  } else if (title.startsWith(normalizedQuery)) {
    score += 60;
  } else if (title.includes(normalizedQuery)) {
    score += 35;
  }

  if (type.includes(normalizedQuery)) {
    score += 15;
  }

  return score;
}

const HeaderSearchResults = ({
  query,
  recentSearches,
  onClose,
  onSearchAll,
  onQuickSearch,
}: HeaderSearchResultsProps) => {
  // Keep the controlled header input responsive and debounce Shopify's live
  // predictive endpoint so quick typing does not issue redundant requests.
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const deferredQuery = debouncedQuery.trim();
  const hasSearchQuery = Boolean(query.trim());
  const normalizedQuery = useMemo(() => normalizeSearchPhrase(deferredQuery), [deferredQuery]);
  const queryTokens = useMemo(() => normalizedQuery.split(/\s+/).filter(Boolean), [normalizedQuery]);
  const canMatchProducts = normalizedQuery.length >= 2;
  // One Shopify predictive request returns products, suggested queries and
  // collections, so typing never downloads or rescans a catalog file.
  const { data: predictiveSearch, isFetching: predictiveFetching } = usePredictiveSearch(
    deferredQuery,
    8,
    canMatchProducts,
  );
  // An empty search box shows popular products instead of a blank panel.
  const { data: popularProducts, isPending: popularPending } = useCollectionPreviewProducts(
    POPULAR_PRODUCTS_COLLECTION,
    6,
    !hasSearchQuery,
  );
  const allProducts = useMemo(
    () => (canMatchProducts ? predictiveSearch?.products ?? [] : []),
    [canMatchProducts, predictiveSearch],
  );
  const typeSuggestions = useMemo(() => {
    const counts = new Map<string, number>();

    allProducts.forEach((product) => {
      const label = String(product.product_type || "").trim();
      if (label) {
        counts.set(label, (counts.get(label) || 0) + 1);
      }
    });

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 24)
      .map(([label]) => ({ label }));
  }, [allProducts]);

  const dropdownProducts = useMemo(() => {
    if (!hasSearchQuery) {
      return (popularProducts ?? []).slice(0, 6);
    }

    return allProducts
      .map((product, index) => ({
        product,
        index,
        score: scoreQuickSearchProduct(product, normalizedQuery, queryTokens),
      }))
      .sort((left, right) => right.score - left.score || left.index - right.index)
      .slice(0, 6)
      .map(({ product }) => product);
  }, [allProducts, hasSearchQuery, normalizedQuery, popularProducts, queryTokens]);

  const productsLoading = hasSearchQuery
    ? canMatchProducts && predictiveFetching && !dropdownProducts.length
    : popularPending;
  const productSectionLabel = hasSearchQuery ? "Product matches" : "Popular right now";
  const predictiveQuerySuggestions = useMemo(
    () =>
      (canMatchProducts ? predictiveSearch?.queries ?? [] : [])
        .filter((text) => normalizeSearchPhrase(text) !== normalizedQuery)
        .slice(0, 5)
        .map((text) => ({ query: text, label: text })),
    [canMatchProducts, normalizedQuery, predictiveSearch],
  );

  const trendingSearches = useMemo(() => {
    const topFromCatalog = typeSuggestions.slice(0, 5).map(({ label }) => label);
    const merged = [...topFromCatalog, ...DEFAULT_TRENDING_SEARCHES];

    return merged
      .filter((value, index) => merged.findIndex((entry) => entry.toLowerCase() === value.toLowerCase()) === index)
      .slice(0, 6);
  }, [typeSuggestions]);

  const categorySuggestions = useMemo(() => {
    const suggestions: Array<{ label: string; to: string }> = [];
    const seen = new Set<string>();

    (canMatchProducts ? predictiveSearch?.collections ?? [] : []).forEach((collection) => {
      const key = `collection:${collection.title.toLowerCase()}`;
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      suggestions.push({ label: collection.title, to: `/collections/${collection.handle}` });
    });

    typeSuggestions.forEach(({ label }) => {
      const key = `type:${label.toLowerCase()}`;
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      suggestions.push({ label, to: `/shop?type=${encodeURIComponent(label)}` });
    });

    return suggestions.slice(0, 8);
  }, [canMatchProducts, predictiveSearch, typeSuggestions]);

  const predictiveCategorySuggestions = categorySuggestions;

  const popularRoutes = [
    { label: "All Products", to: "/shop?collection=all-products" },
    { label: "Best Sellers", to: "/collections/best-sellers" },
    { label: "New Arrivals", to: "/collections/new-arrivals" },
    { label: "All Collections", to: "/collections" },
  ];

  const quickCategoryLinks = useMemo(() => categorySuggestions.slice(0, 3), [categorySuggestions]);
  const quickSearchTerms = useMemo(
    () => (recentSearches.length ? recentSearches : trendingSearches).slice(0, 3),
    [recentSearches, trendingSearches],
  );

  return (
    <div
      className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-[80]"
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="grid gap-2 rounded-[1.15rem] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--background)/0.98),hsl(var(--card)/0.94))] p-2 shadow-[0_18px_36px_-24px_rgba(15,23,42,0.2)] lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] backdrop-blur-xl">
        <section className="rounded-[0.95rem] border border-border/70 bg-background/95 p-2">
          <div className="flex items-center justify-between border-b border-border/70 pb-2">
            <div>
              <p className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {productSectionLabel}
              </p>
              {hasSearchQuery ? (
                <p className="mt-1 text-[0.54rem] leading-5 text-muted-foreground">
                  Matching names, descriptions, tags, and related words.
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onSearchAll}
              className="text-[0.64rem] font-bold uppercase tracking-[0.16em] text-primary transition hover:text-foreground"
            >
              Search all
            </button>
          </div>

          <div className="mt-2 grid max-h-[22rem] grid-cols-1 gap-1.5 overflow-y-auto pr-1">
            {dropdownProducts.map((product) => {
              const image = productImage(product);
              const price = formatMoney(minPrice(product));

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.handle}`}
                  onClick={onClose}
                  className="grid grid-cols-[2.8rem_minmax(0,1fr)_auto] items-start gap-2 rounded-[0.85rem] border border-border/70 bg-background/92 px-2.5 py-2 transition hover:border-primary/20 hover:bg-background"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={product.title}
                      className="h-11 w-11 rounded-[0.8rem] object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-11 w-11 place-items-center rounded-[0.8rem] bg-muted/45 text-[0.44rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                      SALT
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                      {conciseTitle(product.title, 44)}
                    </p>
                  </div>

                  <div className="flex min-h-full flex-col items-end gap-1.5 text-right">
                    <p className="text-sm font-semibold leading-none text-foreground">{price}</p>
                  </div>
                </Link>
              );
            })}

            {productsLoading && !dropdownProducts.length
              ? Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={`search-skeleton-${index}`}
                    className="h-[3.75rem] animate-pulse rounded-[0.85rem] border border-border/70 bg-muted/40"
                  />
                ))
              : null}

            {hasSearchQuery && canMatchProducts && !productsLoading && !dropdownProducts.length ? (
              <div className="rounded-[0.95rem] border border-dashed border-border/70 bg-background/92 px-3 py-4 text-sm text-muted-foreground">
                <p>No match for that word yet. Try a suggestion or category:</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(categorySuggestions.length ? categorySuggestions : popularRoutes).slice(0, 3).map((entry) => (
                    <Link
                      key={`${entry.label}-${entry.to}`}
                      to={entry.to}
                      onClick={onClose}
                      className="rounded-full border border-border/70 bg-muted/45 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-foreground transition hover:border-primary/20 hover:bg-background"
                    >
                      {entry.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[0.95rem] border border-border/70 bg-background/95 p-2">
          {hasSearchQuery ? (
            <div className="rounded-[0.85rem] border border-border/70 bg-background/92 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="mt-2.5 text-[0.64rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Predictive paths
                </p>
                <p className="text-[0.52rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Query aware
                </p>
              </div>

              {predictiveQuerySuggestions.length ? (
                <div className="mt-2.5">
                  <p className="text-[0.52rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Search next
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {predictiveQuerySuggestions.map((suggestion) => (
                      <button
                        key={suggestion.query}
                        type="button"
                        onClick={() => onQuickSearch(suggestion.query)}
                        className="rounded-full border border-border/70 bg-muted/45 px-2 py-1 text-[0.56rem] font-bold uppercase tracking-[0.08em] text-foreground transition hover:border-primary/20 hover:bg-background"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {predictiveCategorySuggestions.length ? (
                <div className="mt-2.5">
                  <p className="text-[0.52rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Jump to category
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {predictiveCategorySuggestions.map((entry) => (
                      <Link
                        key={`${entry.label}-${entry.to}`}
                        to={entry.to}
                        onClick={onClose}
                        className="rounded-full border border-border/70 bg-muted/45 px-2 py-1 text-[0.56rem] font-bold uppercase tracking-[0.08em] text-foreground transition hover:border-primary/20 hover:bg-background"
                      >
                        {entry.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-[0.85rem] border border-border/70 bg-background/92 p-2.5">
            <p className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">Popular routes</p>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
              {popularRoutes.map((route) => (
                <Link
                  key={route.label}
                  to={route.to}
                  onClick={onClose}
                  className="inline-flex items-center justify-between rounded-[0.75rem] border border-transparent bg-background px-2.5 py-2 text-sm font-medium text-foreground transition hover:border-primary/20 hover:bg-muted/40"
                >
                  <span>{route.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-2 rounded-[0.85rem] border border-border/70 bg-background/92 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">Quick picks</p>
              <p className="text-[0.52rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {recentSearches.length ? "Recent first" : "Trending first"}
              </p>
            </div>

            {quickCategoryLinks.length ? (
              <div className="mt-2.5">
                <p className="text-[0.52rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Categories</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {quickCategoryLinks.map((entry) => (
                    <Link
                      key={`${entry.label}-${entry.to}`}
                      to={entry.to}
                      onClick={onClose}
                      className="rounded-full border border-border/70 bg-muted/45 px-2 py-1 text-[0.56rem] font-bold uppercase tracking-[0.08em] text-foreground transition hover:border-primary/20 hover:bg-background"
                    >
                      {entry.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className={quickCategoryLinks.length ? "mt-2.5" : "mt-3"}>
              <p className="text-[0.52rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {recentSearches.length ? "Recent searches" : "Trending searches"}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {quickSearchTerms.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => onQuickSearch(term)}
                    className="rounded-full border border-border/70 bg-muted/45 px-2 py-1 text-[0.56rem] font-bold uppercase tracking-[0.08em] text-foreground transition hover:border-primary/20 hover:bg-background"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HeaderSearchResults;
