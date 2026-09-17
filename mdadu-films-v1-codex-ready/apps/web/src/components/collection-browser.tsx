"use client";
import { useState } from "react";
import type { CollectionKind, ContentItem } from "@/types/content";
import { ContentCard } from "@/components/ui/content-card";
import { EmptyState } from "@/components/ui/feedback";
export function CollectionBrowser({
  items,
  kind,
}: {
  items: ContentItem[];
  kind: CollectionKind;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = [
    "All",
    ...new Set(
      items.map((item) =>
        kind === "projects" ? (item.status ?? item.category) : item.category,
      ),
    ),
  ];
  const results = items.filter(
    (item) =>
      (category === "All" ||
        (kind === "projects"
          ? (item.status ?? item.category)
          : item.category) === category) &&
      `${item.title} ${item.description} ${item.category} ${item.location ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-wrap gap-2" aria-label="Filter by category">
          {categories.map((value) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              aria-pressed={category === value}
              className={`filter-pill ${category === value ? "filter-pill-active" : ""}`}
            >
              {value}
            </button>
          ))}
        </div>
        <label className="grid w-full gap-2 text-sm font-medium sm:w-72">
          Search
          <input
            className="field"
            type="search"
            placeholder="Search by title or keyword"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p role="status" className="mb-4 text-sm text-slate-500">
        {results.length} {results.length === 1 ? "result" : "results"}
      </p>
      {results.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <ContentCard key={item.slug} item={item} kind={kind} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={items.length ? "No matching results." : undefined}
          description={
            items.length
              ? "Try another search or select a different category."
              : undefined
          }
        />
      )}
    </div>
  );
}
