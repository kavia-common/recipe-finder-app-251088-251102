import React from "react";

// PUBLIC_INTERFACE
export function FavoritesBar({ favorites, onOpen, onRemove }) {
  /**
   * Horizontal favorites bar.
   */
  return (
    <aside className="rf-favorites" aria-label="Favorites">
      <div className="rf-favorites__header">
        <h2 className="rf-sectionTitle">Favorites</h2>
        <span className="rf-metaText">{favorites.length}</span>
      </div>

      {favorites.length === 0 ? (
        <p className="rf-muted">No favorites yet. Star a recipe to save it here.</p>
      ) : (
        <div className="rf-favorites__list" role="list">
          {favorites.map((f) => (
            <div key={f.id} className="rf-favChip" role="listitem">
              <button type="button" className="rf-favChip__main" onClick={() => onOpen(f)} title={`Open ${f.title}`}>
                <span className="rf-favChip__star" aria-hidden="true">
                  ★
                </span>
                <span className="rf-favChip__text">{f.title || "Untitled"}</span>
              </button>
              <button
                type="button"
                className="rf-favChip__remove"
                onClick={() => onRemove(f.id)}
                aria-label={`Remove ${f.title || "favorite"} from favorites`}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
