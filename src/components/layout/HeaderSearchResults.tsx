import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import { conciseTitle, formatMoney, minPrice, productImage } from "@/lib/formatters";
import { useCollectionPreviewProducts, usePredictiveSearch } from "@/lib/live-product-listings";
import type { ShopifyProduct } from "@/types/shopify";

// Based on the best-selling products of the last 12 months.
const DEFAULT_TRENDING_SEARCHES = ["Jeans", "Robe", "Perfume", "Watch", "Wallet"];
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
  const productSectionLabel = hasSearchQuery ? "Products" : "Trending now";
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

  const collectionLinks = categorySuggestions.slice(0, 3);
  const searchTerms = (recentSearches.length ? recentSearches : trendingSearches).slice(0, 5);
  const trimmedQuery = query.trim();

  const chipClass =
    "rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/30 hover:bg-background";

  return (
    <div
      className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[80]"
      onMouseDown={(event) => event.preventDefault()}
    >
      <div className="max-h-[min(34rem,calc(100vh-8rem))] overflow-y-auto rounded-2xl border border-border/70 bg-background p-2 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)]">
        {hasSearchQuery && predictiveQuerySuggestions.length ? (
          <ul aria-label="Suggested searches" className="pb-1">
            {predictiveQuerySuggestions.map((suggestion) => (
              <li key={suggestion.query}>
                <button
                  type="button"
                  onClick={() => onQuickSearch(suggestion.query)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-foreground transition hover:bg-muted/50"
                >
                  <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate">{suggestion.label}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {!hasSearchQuery && searchTerms.length ? (
          <div className="px-2 pb-2 pt-1">
            <p className="text-xs font-semibold text-muted-foreground">
              {recentSearches.length ? "Recent searches" : "Popular searches"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {searchTerms.map((term) => (
                <button key={term} type="button" onClick={() => onQuickSearch(term)} className={chipClass}>
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {hasSearchQuery && collectionLinks.length ? (
          <div className="flex flex-wrap gap-1.5 border-t border-border/60 px-2 py-2">
            {collectionLinks.map((entry) => (
              <Link key={`${entry.label}-${entry.to}`} to={entry.to} onClick={onClose} className={chipClass}>
                {entry.label}
              </Link>
            ))}
          </div>
        ) : null}

        <div className={hasSearchQuery || searchTerms.length ? "border-t border-border/60 pt-1" : ""}>
          <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted-foreground">{productSectionLabel}</p>

          <ul className="grid gap-0.5">
            {productsLoading && !dropdownProducts.length
              ? Array.from({ length: 4 }, (_, index) => (
                  <li key={`search-skeleton-${index}`} className="mx-1 h-14 animate-pulse rounded-xl bg-muted/40" />
                ))
              : null}

            {dropdownProducts.map((product) => {
              const image = productImage(product);

              return (
                <li key={product.id}>
                  <Link
                    to={`/products/${product.handle}`}
                    onClick={onClose}
                    className="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-muted/50"
                  >
                    {image ? (
                      <img src={image} alt="" className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
                    ) : (
                      <span className="h-12 w-12 rounded-lg bg-muted/50" aria-hidden="true" />
                    )}
                    <span className="line-clamp-2 text-sm leading-snug text-foreground">{conciseTitle(product.title, 70)}</span>
                    <span className="text-sm font-semibold text-foreground">{formatMoney(minPrice(product))}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {hasSearchQuery && canMatchProducts && !productsLoading && !dropdownProducts.length ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No products match "{trimmedQuery}" yet. Try a shorter or different word.
            </p>
          ) : null}
        </div>

        {hasSearchQuery ? (
          <button
            type="button"
            onClick={onSearchAll}
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-muted/50 px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted"
          >
            See all results for "{trimmedQuery}"
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <Link
            to="/collections/best-sellers"
            onClick={onClose}
            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-muted/50 px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted"
          >
            Shop all best sellers
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default HeaderSearchResults;
