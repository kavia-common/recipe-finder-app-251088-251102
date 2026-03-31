import React, { useEffect, useMemo } from "react";

function useEscapeToClose(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);
}

// PUBLIC_INTERFACE
export function RecipeDetailsModal({
  isOpen,
  recipe,
  isLoading,
  errorMessage,
  onClose,
  isFavorite,
  onToggleFavorite
}) {
  /**
   * Modal overlay for recipe details.
   */
  useEscapeToClose(isOpen, onClose);

  const titleId = useMemo(() => `rf-modal-title-${recipe?.id || "x"}`, [recipe?.id]);

  if (!isOpen) return null;

  return (
    <div className="rf-modalOverlay" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="rf-modal">
        <div className="rf-modal__header">
          <h2 className="rf-modal__title" id={titleId}>
            {recipe?.title || "Recipe details"}
          </h2>

          <div className="rf-modal__headerActions">
            {recipe ? (
              <button
                type="button"
                className={`rf-favBtn rf-favBtn--modal ${isFavorite ? "rf-favBtn--active" : ""}`}
                aria-pressed={isFavorite}
                onClick={() => onToggleFavorite(recipe)}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
                <span className="rf-favBtn__text">{isFavorite ? "Favorited" : "Favorite"}</span>
              </button>
            ) : null}

            <button type="button" className="rf-iconBtn" onClick={onClose} aria-label="Close details">
              ✕
            </button>
          </div>
        </div>

        <div className="rf-modal__content">
          {isLoading ? <div className="rf-state rf-state--loading">Loading recipe…</div> : null}
          {errorMessage ? <div className="rf-state rf-state--error">{errorMessage}</div> : null}

          {!isLoading && !errorMessage && recipe ? (
            <div className="rf-details">
              <div className="rf-details__top">
                <div className="rf-details__imgWrap">
                  <img className="rf-details__img" src={recipe.imageUrl} alt={recipe.title} />
                </div>
                <div className="rf-details__meta">
                  <div className="rf-badges">
                    {recipe.category ? <span className="rf-badge">{recipe.category}</span> : null}
                    {recipe.area ? <span className="rf-badge rf-badge--alt">{recipe.area}</span> : null}
                    {recipe.tags ? <span className="rf-badge rf-badge--soft">Tags: {recipe.tags}</span> : null}
                  </div>

                  {recipe.sourceUrl ? (
                    <a className="rf-link" href={recipe.sourceUrl} target="_blank" rel="noreferrer">
                      Source ↗
                    </a>
                  ) : null}
                  {recipe.youtubeUrl ? (
                    <a className="rf-link" href={recipe.youtubeUrl} target="_blank" rel="noreferrer">
                      Video ↗
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="rf-details__grid">
                <section className="rf-panel" aria-label="Ingredients">
                  <h3 className="rf-panel__title">Ingredients</h3>
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    <ul className="rf-list">
                      {recipe.ingredients.map((ing, idx) => (
                        <li key={`${ing}-${idx}`} className="rf-list__item">
                          {ing}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rf-muted">No ingredients provided.</p>
                  )}
                </section>

                <section className="rf-panel" aria-label="Instructions">
                  <h3 className="rf-panel__title">Instructions</h3>
                  {recipe.instructions ? (
                    <p className="rf-instructions">{recipe.instructions}</p>
                  ) : (
                    <p className="rf-muted">No instructions provided.</p>
                  )}
                </section>
              </div>
            </div>
          ) : null}

          {!isLoading && !errorMessage && !recipe ? (
            <div className="rf-state rf-state--empty">No recipe selected.</div>
          ) : null}
        </div>
      </div>

      <button type="button" className="rf-modalOverlay__backdrop" onClick={onClose} aria-label="Close modal backdrop" />
    </div>
  );
}
