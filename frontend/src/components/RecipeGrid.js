import React from "react";

function placeholderImageDataUri(title) {
  const text = encodeURIComponent((title || "Recipe").slice(0, 18));
  // Simple SVG placeholder (no external assets)
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#22c55e" offset="0"/>
          <stop stop-color="#3b82f6" offset="1"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <rect x="36" y="36" width="728" height="528" rx="24" fill="rgba(0,0,0,0.28)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
        font-size="42" fill="white" opacity="0.92">${text}</text>
    </svg>`
  )}`;
}

function RecipeCard({ recipe, onOpen, isFavorite, onToggleFavorite }) {
  const imgSrc = recipe.imageUrl || placeholderImageDataUri(recipe.title);

  return (
    <article className="rf-card">
      <button className="rf-card__media" type="button" onClick={() => onOpen(recipe)} aria-label={`Open ${recipe.title}`}>
        <img
          className="rf-card__img"
          src={imgSrc}
          alt={recipe.title || "Recipe"}
          loading="lazy"
          onError={(e) => {
            // Avoid broken images
            e.currentTarget.src = placeholderImageDataUri(recipe.title);
          }}
        />
      </button>

      <div className="rf-card__body">
        <div className="rf-card__titleRow">
          <h3 className="rf-card__title">{recipe.title || "Untitled recipe"}</h3>
          <button
            type="button"
            className={`rf-favBtn ${isFavorite ? "rf-favBtn--active" : ""}`}
            aria-pressed={isFavorite}
            onClick={() => onToggleFavorite(recipe)}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <span className="rf-favBtn__icon" aria-hidden="true">
              {isFavorite ? "★" : "☆"}
            </span>
            <span className="rf-srOnly">{isFavorite ? "Remove favorite" : "Add favorite"}</span>
          </button>
        </div>

        <p className="rf-card__meta">
          {(recipe.category || recipe.area) && (
            <>
              <span>{recipe.category}</span>
              {recipe.category && recipe.area ? <span className="rf-dot">•</span> : null}
              <span>{recipe.area}</span>
            </>
          )}
        </p>

        <div className="rf-card__actions">
          <button className="rf-btn rf-btn--ghost" type="button" onClick={() => onOpen(recipe)}>
            View details
          </button>
        </div>
      </div>
    </article>
  );
}

// PUBLIC_INTERFACE
export function RecipeGrid({ recipes, onOpen, favoritesById, onToggleFavorite }) {
  /**
   * Responsive grid of recipe cards.
   */
  return (
    <section className="rf-grid" aria-label="Recipe results">
      {recipes.map((r) => (
        <RecipeCard
          key={r.id}
          recipe={r}
          onOpen={onOpen}
          isFavorite={Boolean(favoritesById[r.id])}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </section>
  );
}
