/**
 * Minimal recipe API client.
 *
 * This app expects REACT_APP_API_BASE to point to a public recipe API.
 * By default, the implementation supports TheMealDB-compatible endpoints:
 * - GET {base}/search.php?s=<query>
 * - GET {base}/lookup.php?i=<id>
 *
 * If your API differs, adjust the endpoint builders + normalizers below.
 */

const DEFAULT_API_BASE = "https://www.themealdb.com/api/json/v1/1";

/**
 * Safely read an environment variable from CRA (REACT_APP_*).
 */
function getEnv(key, fallback = undefined) {
  const value = process.env[key];
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  return fallback;
}

function getApiBase() {
  return getEnv("REACT_APP_API_BASE", DEFAULT_API_BASE);
}

function buildSearchUrl({ query, diet }) {
  const base = getApiBase();
  const url = new URL(`${base.replace(/\/$/, "")}/search.php`);
  // TheMealDB uses ?s=... for search. We treat diet as a client-side filter.
  url.searchParams.set("s", query);
  if (diet) url.searchParams.set("diet", diet); // harmless for TheMealDB; may be used by other APIs
  return url.toString();
}

function buildDetailsUrl({ id }) {
  const base = getApiBase();
  const url = new URL(`${base.replace(/\/$/, "")}/lookup.php`);
  url.searchParams.set("i", id);
  return url.toString();
}

function normalizeMealToRecipe(meal) {
  if (!meal) return null;

  const ingredients = [];
  for (let i = 1; i <= 20; i += 1) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (typeof ing === "string" && ing.trim()) {
      const m = typeof measure === "string" ? measure.trim() : "";
      ingredients.push(m ? `${m} ${ing.trim()}` : ing.trim());
    }
  }

  const instructions =
    typeof meal.strInstructions === "string" && meal.strInstructions.trim()
      ? meal.strInstructions.trim()
      : "";

  return {
    id: meal.idMeal,
    title: meal.strMeal,
    imageUrl: meal.strMealThumb,
    category: meal.strCategory || "",
    area: meal.strArea || "",
    tags: meal.strTags || "",
    sourceUrl: meal.strSource || "",
    youtubeUrl: meal.strYoutube || "",
    ingredients,
    instructions
  };
}

function normalizeSearchResponse(json) {
  // TheMealDB: { meals: [...] | null }
  if (!json || !Array.isArray(json.meals)) return [];
  return json.meals.map(normalizeMealToRecipe).filter(Boolean);
}

function normalizeDetailsResponse(json) {
  if (!json || !Array.isArray(json.meals) || json.meals.length === 0) return null;
  return normalizeMealToRecipe(json.meals[0]);
}

async function fetchJson(url, { signal } = {}) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    signal
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API request failed (${res.status}): ${text || res.statusText}`);
  }

  return res.json();
}

// PUBLIC_INTERFACE
export async function searchRecipes({ query, diet, signal } = {}) {
  /**
   * Search recipes by keyword.
   * @param {object} params
   * @param {string} params.query - Search keyword (required)
   * @param {string} [params.diet] - Optional dietary filter (client-side filter in this implementation)
   * @param {AbortSignal} [params.signal] - abort signal
   * @returns {Promise<Array>} normalized recipes
   */
  const safeQuery = typeof query === "string" ? query.trim() : "";
  if (!safeQuery) return [];

  const url = buildSearchUrl({ query: safeQuery, diet });
  const json = await fetchJson(url, { signal });

  // In this implementation, diet is a client-side "tag" filter for TheMealDB (tags can include e.g. "Vegetarian")
  const recipes = normalizeSearchResponse(json);
  if (!diet) return recipes;

  const dietLower = diet.toLowerCase();
  return recipes.filter((r) => {
    const haystack = `${r.category} ${r.tags}`.toLowerCase();
    return haystack.includes(dietLower);
  });
}

// PUBLIC_INTERFACE
export async function getRecipeDetails({ id, signal } = {}) {
  /**
   * Fetch full recipe details (ingredients + instructions).
   * @param {object} params
   * @param {string} params.id - Recipe ID (required)
   * @param {AbortSignal} [params.signal] - abort signal
   * @returns {Promise<object|null>} normalized recipe or null if not found
   */
  const safeId = typeof id === "string" ? id.trim() : "";
  if (!safeId) return null;

  const url = buildDetailsUrl({ id: safeId });
  const json = await fetchJson(url, { signal });
  return normalizeDetailsResponse(json);
}

// PUBLIC_INTERFACE
export function getApiInfo() {
  /** Return runtime API configuration info for debugging/help UI. */
  return {
    apiBase: getApiBase(),
    supports: ["search.php?s=", "lookup.php?i="]
  };
}
