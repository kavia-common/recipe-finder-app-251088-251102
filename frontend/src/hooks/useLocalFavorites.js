import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "recipeFinder:favorites:v1";

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function loadFavorites() {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = safeParse(raw, []);
  if (!Array.isArray(parsed)) return [];
  // Keep only minimal shape we need
  return parsed
    .filter((x) => x && typeof x.id === "string")
    .map((x) => ({
      id: x.id,
      title: typeof x.title === "string" ? x.title : "",
      imageUrl: typeof x.imageUrl === "string" ? x.imageUrl : ""
    }));
}

function saveFavorites(favs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

// PUBLIC_INTERFACE
export function useLocalFavorites() {
  /**
   * Favorites stored locally in localStorage.
   * Returns:
   * - favorites: array of {id,title,imageUrl}
   * - favoritesById: map-like object for quick lookup
   * - isFavorite(id): boolean
   * - addFavorite(recipe)
   * - removeFavorite(id)
   * - toggleFavorite(recipe)
   */
  const [favorites, setFavorites] = useState(() => loadFavorites());

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const favoritesById = useMemo(() => {
    const map = {};
    for (const f of favorites) map[f.id] = f;
    return map;
  }, [favorites]);

  const isFavorite = useCallback(
    (id) => Boolean(id && favoritesById[id]),
    [favoritesById]
  );

  const addFavorite = useCallback((recipe) => {
    if (!recipe || typeof recipe.id !== "string") return;
    setFavorites((prev) => {
      if (prev.some((f) => f.id === recipe.id)) return prev;
      return [
        { id: recipe.id, title: recipe.title || "", imageUrl: recipe.imageUrl || "" },
        ...prev
      ];
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    if (typeof id !== "string") return;
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const toggleFavorite = useCallback(
    (recipe) => {
      if (!recipe || typeof recipe.id !== "string") return;
      if (isFavorite(recipe.id)) removeFavorite(recipe.id);
      else addFavorite(recipe);
    },
    [addFavorite, isFavorite, removeFavorite]
  );

  return {
    favorites,
    favoritesById,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite
  };
}
