import { Movie, RecommendationResult, FeatureWeights, DEFAULT_WEIGHTS } from '../types';
import { nollywoodMovies } from '../data/nollywoodData';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

function buildTermFrequency(text: string): Map<string, number> {
  const tokens = tokenize(text);
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  const maxFreq = Math.max(...freq.values(), 1);
  for (const [k, v] of freq) {
    freq.set(k, v / maxFreq);
  }
  return freq;
}

function cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const [key, val] of vecA) {
    magA += val * val;
    if (vecB.has(key)) {
      dotProduct += val * (vecB.get(key) || 0);
    }
  }
  for (const [, val] of vecB) {
    magB += val * val;
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

function buildFeatureVector(movie: Movie, feature: keyof FeatureWeights): Map<string, number> {
  switch (feature) {
    case 'synopsis':
      return buildTermFrequency(movie.synopsis);
    case 'genre':
      return buildTermFrequency(movie.genre.join(' '));
    case 'cast':
      return buildTermFrequency(movie.cast.join(' '));
    case 'director':
      return buildTermFrequency(movie.director);
    case 'keywords':
      return buildTermFrequency(movie.keywords.join(' '));
    default:
      return new Map();
  }
}

function findMatchingFeatures(
  source: Movie,
  target: Movie,
  sourceVecs: Map<keyof FeatureWeights, Map<string, number>>,
  targetVecs: Map<keyof FeatureWeights, Map<string, number>>
): string[] {
  const matches: string[] = [];

  const sourceGenreTokens = new Set(tokenize(source.genre.join(' ')));
  const targetGenreTokens = new Set(tokenize(target.genre.join(' ')));
  const sharedGenres = [...sourceGenreTokens].filter(t => targetGenreTokens.has(t));

  if (sharedGenres.length > 0) {
    matches.push(`Shared genres: ${sharedGenres.join(', ')}`);
  }

  const sourceCast = new Set(source.cast.map(c => c.toLowerCase()));
  const targetCast = new Set(target.cast.map(c => c.toLowerCase()));
  const sharedCast = [...sourceCast].filter(c => targetCast.has(c));
  if (sharedCast.length > 0) {
    matches.push(`Shared cast: ${sharedCast.join(', ')}`);
  }

  if (source.director.toLowerCase() === target.director.toLowerCase()) {
    matches.push(`Same director: ${source.director}`);
  }

  const sourceKeywords = new Set(source.keywords.map(k => k.toLowerCase()));
  const targetKeywords = new Set(target.keywords.map(k => k.toLowerCase()));
  const sharedKeywords = [...sourceKeywords].filter(k => targetKeywords.has(k));
  if (sharedKeywords.length > 0) {
    matches.push(`Similar themes: ${sharedKeywords.slice(0, 3).join(', ')}`);
  }

  return matches;
}

export function getRecommendations(
  movie: Movie,
  weights: FeatureWeights = DEFAULT_WEIGHTS,
  topN: number = 6
): RecommendationResult[] {
  const features = Object.keys(weights) as (keyof FeatureWeights)[];

  const sourceVecs = new Map<keyof FeatureWeights, Map<string, number>>();
  for (const feature of features) {
    sourceVecs.set(feature, buildFeatureVector(movie, feature));
  }

  const scores: { movie: Movie; score: number; matchingFeatures: string[] }[] = [];

  for (const candidate of nollywoodMovies) {
    if (candidate.id === movie.id) continue;

    const candidateVecs = new Map<keyof FeatureWeights, Map<string, number>>();
    for (const feature of features) {
      candidateVecs.set(feature, buildFeatureVector(candidate, feature));
    }

    let totalScore = 0;
    for (const feature of features) {
      const similarity = cosineSimilarity(
        sourceVecs.get(feature)!,
        candidateVecs.get(feature)!
      );
      totalScore += similarity * weights[feature];
    }

    const matchingFeatures = findMatchingFeatures(movie, candidate, sourceVecs, candidateVecs);

    scores.push({
      movie: candidate,
      score: Math.round(totalScore * 1000) / 1000,
      matchingFeatures,
    });
  }

  return scores.sort((a, b) => b.score - a.score).slice(0, topN);
}

export function searchMovies(query: string): Movie[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const queryTokens = new Set(tokenize(q));

  return nollywoodMovies.filter(movie => {
    const searchable = [
      movie.title,
      movie.director,
      ...movie.genre,
      ...movie.cast,
      ...movie.keywords,
      movie.synopsis,
    ]
      .join(' ')
      .toLowerCase();

    const movieTokens = tokenize(searchable);
    return movieTokens.some(t => queryTokens.has(t));
  });
}

export function getMoviesByGenre(genre: string): Movie[] {
  return nollywoodMovies.filter(m => m.genre.includes(genre));
}

export function getMoviesByStreaming(platform: string): Movie[] {
  return nollywoodMovies.filter(m => m.streaming === platform);
}

export function getSimilarMovie(movie: Movie): RecommendationResult | null {
  const recs = getRecommendations(movie, DEFAULT_WEIGHTS, 1);
  return recs[0] || null;
}