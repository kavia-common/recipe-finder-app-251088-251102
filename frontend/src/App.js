import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { Header } from "./components/Header";
import { RecipeGrid } from "./components/RecipeGrid";
import { RecipeDetailsModal } from "./components/RecipeDetailsModal";
import { FavoritesBar } from "./components/FavoritesBar";
import { getApiInfo, getRecipeDetails, searchRecipes } from "./services/recipeApi";
import { useLocalFavorites } from "./hooks/useLocalFavorites";

function validateQuery(q) {
  const s = typeof q === "string" ? q.trim() : "";
  if (s.length === 0) return { ok: false, message: "Enter a keyword to search." };
  if (s.length < 2) return { ok: false, message: "Please enter at least 2 characters." };
  return { ok: true, value: s };
}

// PUBLIC_INTERFACE
function App() {
  /** Main Recipe Finder SPA. */
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsRecipe, setDetailsRecipe] = useState(null);

  const { favorites, favoritesById, removeFavorite, toggleFavorite, isFavorite } = useLocalFavorites();

  const apiInfo = useMemo(() => getApiInfo(), []);
  const listAbortRef = useRef(null);
  const detailsAbortRef = useRef(null);

  const runSearch = useCallback(
    async (overrideQuery) => {
      const candidate = validateQuery(typeof overrideQuery === "string" ? overrideQuery : query);
      if (!candidate.ok) {
        setListError(candidate.message);
        return;
      }

      // Abort any in-flight search
      if (listAbortRef.current) listAbortRef.current.abort();
      const controller = new AbortController();
      listAbortRef.current = controller;

      setHasSearched(true);
      setListError("");
      setListLoading(true);

      try {
        const results = await searchRecipes({
          query: candidate.value,
          diet,
          signal: controller.signal
        });
        setRecipes(results);
      } catch (e) {
        if (e && typeof e === "object" && e.name === "AbortError") return;
        setListError(e instanceof Error ? e.message : "Search failed. Please try again.");
      } finally {
        setListLoading(false);
      }
    },
    [diet, query]
  );

  const openDetailsFor = useCallback(async (recipe) => {
    if (!recipe || typeof recipe.id !== "string") return;

    setDetailsOpen(true);
    setSelectedId(recipe.id);

    // If we already have full details (from lookup), keep it; otherwise fetch.
    setDetailsRecipe((prev) => (prev && prev.id === recipe.id ? prev : recipe));
  }, []);

  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
    setDetailsError("");
  }, []);

  useEffect(() => {
    async function loadDetails(id) {
      if (!detailsOpen || !id) return;

      if (detailsAbortRef.current) detailsAbortRef.current.abort();
      const controller = new AbortController();
      detailsAbortRef.current = controller;

      setDetailsError("");
      setDetailsLoading(true);

      try {
        const full = await getRecipeDetails({ id, signal: controller.signal });
        if (!full) {
          setDetailsError("Recipe not found.");
          setDetailsRecipe(null);
          return;
        }
        setDetailsRecipe(full);
      } catch (e) {
        if (e && typeof e === "object" && e.name === "AbortError") return;
        setDetailsError(e instanceof Error ? e.message : "Failed to load recipe details.");
      } finally {
        setDetailsLoading(false);
      }
    }

    loadDetails(selectedId);
    return () => {
      // no-op; abort handled per-request
    };
  }, [detailsOpen, selectedId]);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      runSearch();
    },
    [runSearch]
  );

  const onOpenFromFavorite = useCallback(
    (fav) => {
      // Favorites store minimal info; fetch full details by id.
      openDetailsFor({ id: fav.id, title: fav.title, imageUrl: fav.imageUrl });
    },
    [openDetailsFor]
  );

  const mainState = useMemo(() => {
    if (listLoading) return { kind: "loading" };
    if (listError) return { kind: "error", message: listError };
    if (!hasSearched) return { kind: "idle" };
    if (recipes.length === 0) return { kind: "empty" };
    return { kind: "ready" };
  }, [hasSearched, listError, listLoading, recipes.length]);

  return (
    <div className="App">
      <div className="rf-scanlines" aria-hidden="true" />
      <div className="rf-shell">
        <Header
          query={query}
          onQueryChange={(v) => {
            setQuery(v);
            if (listError) setListError("");
          }}
          onSubmit={onSubmit}
          diet={diet}
          onDietChange={setDiet}
          resultCount={hasSearched ? recipes.length : null}
          isLoading={listLoading}
        />

        <main className="rf-main">
          <div className="rf-left">
            <FavoritesBar favorites={favorites} onOpen={onOpenFromFavorite} onRemove={removeFavorite} />

            <section className="rf-results" aria-label="Results">
              <div className="rf-results__header">
                <h2 className="rf-sectionTitle">Results</h2>
                <p className="rf-muted rf-small">
                  API: <span className="rf-mono">{apiInfo.apiBase}</span>
                </p>
              </div>

              {mainState.kind === "idle" ? (
                <div className="rf-state rf-state--idle">
                  <p className="rf-state__title">Find something delicious.</p>
                  <p className="rf-muted">
                    Search by keyword, optionally add a diet hint, then open a recipe for ingredients and instructions.
                  </p>
                </div>
              ) : null}

              {mainState.kind === "loading" ? (
                <div className="rf-state rf-state--loading">
                  <div className="rf-loader" aria-hidden="true" />
                  <p>Searching recipes…</p>
                </div>
              ) : null}

              {mainState.kind === "error" ? (
                <div className="rf-state rf-state--error" role="alert">
                  <p className="rf-state__title">Something went wrong</p>
                  <p className="rf-muted">{mainState.message}</p>
                  <button className="rf-btn rf-btn--ghost" type="button" onClick={() => runSearch()}>
                    Retry
                  </button>
                </div>
              ) : null}

              {mainState.kind === "empty" ? (
                <div className="rf-state rf-state--empty">
                  <p className="rf-state__title">No matches</p>
                  <p className="rf-muted">Try a different keyword (or remove the diet filter).</p>
                </div>
              ) : null}

              {mainState.kind === "ready" ? (
                <RecipeGrid
                  recipes={recipes}
                  onOpen={openDetailsFor}
                  favoritesById={favoritesById}
                  onToggleFavorite={toggleFavorite}
                />
              ) : null}
            </section>
          </div>

          <aside className="rf-right" aria-label="Tips">
            <div className="rf-panel rf-panel--sticky">
              <h3 className="rf-panel__title">Quick tips</h3>
              <ul className="rf-list">
                <li className="rf-list__item">Use short keywords like “beef” or “noodles”.</li>
                <li className="rf-list__item">Star recipes to keep them for later (saved locally).</li>
                <li className="rf-list__item">Press Esc to close recipe details.</li>
              </ul>

              <div className="rf-divider" />

              <p className="rf-muted rf-small">
                Configure API via <span className="rf-mono">REACT_APP_API_BASE</span>.
              </p>
            </div>
          </aside>
        </main>

        <footer className="rf-footer">
          <span className="rf-muted rf-small">Recipe Finder • Retro UI • Local favorites</span>
        </footer>
      </div>

      <RecipeDetailsModal
        isOpen={detailsOpen}
        recipe={detailsRecipe}
        isLoading={detailsLoading}
        errorMessage={detailsError}
        onClose={closeDetails}
        isFavorite={selectedId ? isFavorite(selectedId) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}

export default App;
