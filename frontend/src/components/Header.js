import React from "react";

// PUBLIC_INTERFACE
export function Header({
  query,
  onQueryChange,
  onSubmit,
  diet,
  onDietChange,
  resultCount,
  isLoading
}) {
  /**
   * App header with search + optional dietary filter.
   */
  return (
    <header className="rf-header">
      <div className="rf-header__brand">
        <div className="rf-logo" aria-hidden="true">
          RF
        </div>
        <div>
          <h1 className="rf-title">Recipe Finder</h1>
          <p className="rf-subtitle">Search. Save favorites. Cook something retro.</p>
        </div>
      </div>

      <form className="rf-search" onSubmit={onSubmit} role="search" aria-label="Search recipes">
        <label className="rf-field">
          <span className="rf-field__label">Keyword</span>
          <input
            className="rf-input"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="e.g. chicken, pasta, curry"
            autoComplete="off"
          />
        </label>

        <label className="rf-field">
          <span className="rf-field__label">Diet (optional)</span>
          <select className="rf-select" value={diet} onChange={(e) => onDietChange(e.target.value)}>
            <option value="">Any</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten-free">Gluten-Free</option>
            <option value="dairy-free">Dairy-Free</option>
          </select>
        </label>

        <button className="rf-btn rf-btn--primary" type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>

        <div className="rf-search__meta" aria-live="polite">
          {typeof resultCount === "number" ? (
            <span className="rf-metaText">
              {resultCount === 0 ? "No results yet" : `${resultCount} result${resultCount === 1 ? "" : "s"}`}
            </span>
          ) : (
            <span className="rf-metaText">Type a keyword and hit Search</span>
          )}
        </div>
      </form>
    </header>
  );
}
