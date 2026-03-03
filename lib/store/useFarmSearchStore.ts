import { create } from "zustand";

export type FarmSearchParams =
  | { kind: "zip"; zip: string; radiusMiles: number }
  | { kind: "cityState"; city: string; state: string };

type FarmSearchState = {
  searchInput: string;
  radiusInput: string;
  submitted: FarmSearchParams | null;
  page: number;
  validationError: string;

  setSearchInput: (value: string) => void;
  setRadiusInput: (value: string) => void;
  setPage: (page: number | ((prev: number) => number)) => void;
  submit: () => FarmSearchParams | null;
};

function parseRadiusMiles(input: string): number {
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) return 30;
  return Math.max(1, Math.min(100, Math.round(parsed)));
}

function parseSearchInput(input: string, radiusInput: string): { params: FarmSearchParams | null; error: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { params: null, error: "Please enter a zip code or 'City, State'." };
  }

  if (/^\d{5}$/.test(trimmed)) {
    return {
      params: { kind: "zip", zip: trimmed, radiusMiles: parseRadiusMiles(radiusInput) },
      error: "",
    };
  }

  const parts = trimmed.split(",");
  if (parts.length === 2) {
    const city = parts[0].trim();
    const state = parts[1].trim();
    if (!city || !state) {
      return { params: null, error: "Please enter a zip code or 'City, State'." };
    }
    return { params: { kind: "cityState", city, state }, error: "" };
  }

  return { params: null, error: "Please enter a zip code or 'City, State'." };
}

export const useFarmSearchStore = create<FarmSearchState>((set, get) => ({
  searchInput: "",
  radiusInput: "30",
  submitted: null,
  page: 1,
  validationError: "",

  setSearchInput: (value) => set({ searchInput: value }),
  setRadiusInput: (value) => set({ radiusInput: value }),
  setPage: (page) =>
    set((state) => {
      const next = typeof page === "function" ? page(state.page) : page;
      return { page: Math.max(1, next) };
    }),
  submit: () => {
    const { searchInput, radiusInput } = get();
    const { params, error } = parseSearchInput(searchInput, radiusInput);
    set({
      submitted: params,
      validationError: error,
      page: 1,
    });
    return params;
  },
}));
