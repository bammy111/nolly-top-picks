export interface Movie {
  id: number;
  title: string;
  year: number;
  genre: string[];
  director: string;
  cast: string[];
  synopsis: string;
  keywords: string[];
  posterUrl: string;
  rating: number;
  streaming: string;
  runtime: number;
}

export interface RecommendationResult {
  movie: Movie;
  score: number;
  matchingFeatures: string[];
}

export interface FilterOptions {
  genre: string | null;
  minRating: number;
  search: string;
}

export interface NotebookSection {
  title: string;
  code: string;
  description: string;
}

export interface FeatureWeights {
  synopsis: number;
  genre: number;
  cast: number;
  director: number;
  keywords: number;
}

export const DEFAULT_WEIGHTS: FeatureWeights = {
  synopsis: 0.35,
  genre: 0.25,
  cast: 0.15,
  director: 0.1,
  keywords: 0.15,
};