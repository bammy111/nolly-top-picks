import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkle, MagnifyingGlass, FilmStrip, Star, PlayCircle,
  ArrowRight, Clock, Users, Calendar, Sliders, ListBullets,
  MoonStars, Sun, GithubLogo, X, DownloadSimple, ShareNetwork
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Movie, RecommendationResult, FilterOptions, FeatureWeights, DEFAULT_WEIGHTS } from './types';
import { nollywoodMovies, nollywoodGenres } from './data/nollywoodData';
import { getRecommendations, searchMovies } from './utils/recommenderEngine';
import NotebookViewer from './components/NotebookViewer';

function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({ genre: null, minRating: 0, search: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [weights, setWeights] = useState<FeatureWeights>(DEFAULT_WEIGHTS);
  const [showWeights, setShowWeights] = useState(false);

  const filteredMovies = useMemo(() => {
    let results = nollywoodMovies;
    if (filters.genre) {
      results = results.filter(m => m.genre.includes(filters.genre!));
    }
    if (filters.minRating > 0) {
      results = results.filter(m => m.rating >= filters.minRating);
    }
    if (filters.search) {
      results = searchMovies(filters.search);
    }
    return results;
  }, [filters]);

  const handleMovieSelect = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    const recs = getRecommendations(movie, weights);
    setRecommendations(recs);
    setShowNotebook(false);
  }, [weights]);

  const handleGetRecommendations = useCallback(() => {
    if (selectedMovie) {
      const recs = getRecommendations(selectedMovie, weights);
      setRecommendations(recs);
      toast.success(`Found ${recs.length} recommendations for "${selectedMovie.title}"`);
    }
  }, [selectedMovie, weights]);

  const handleWeightChange = (feature: keyof FeatureWeights, value: number) => {
    setWeights(prev => ({ ...prev, [feature]: value }));
  };

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" as const } },
  } as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <FilmStrip size={20} className="text-white" weight="fill" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                <span className="text-emerald-500">Nolly</span>
                <span className="text-yellow-500">Reel</span>
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Movie Recommender</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setShowNotebook(!showNotebook)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-600/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkle size={16} weight="fill" />
              <span className="hidden sm:inline">Notebook</span>
            </motion.button>
            <motion.button
              onClick={toggleDark}
              className="p-2.5 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {darkMode ? <Sun size={18} /> : <MoonStars size={18} />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        {!selectedMovie && !showNotebook && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" as const }}
            className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-yellow-900 p-8 md:p-12"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,179,8,0.15),transparent_50%)]" />
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-yellow-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-600/30"
              >
                <Sparkle size={28} className="text-white" weight="fill" />
              </motion.div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Discover{' '}
                <span className="bg-gradient-to-r from-emerald-300 to-yellow-400 bg-clip-text text-transparent">
                  Nollywood
                </span>
                <br />
                Movies You'll Love
              </h2>
              <p className="text-emerald-100/80 text-lg max-w-xl mb-8">
                Our AI-powered engine analyzes plots, genres, cast, and themes to find your next favorite film from Nigeria's vibrant cinema.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-xl">
                <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search movies, actors, directors..."
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-base"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters(f => ({ ...f, search: '' }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X size={16} className="text-white/70" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Notebook View */}
        {showNotebook && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" as const }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Algorithm Explorer</h2>
              <motion.button
                onClick={() => setShowNotebook(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:bg-accent transition-colors text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FilmStrip size={16} />
                Back to Movies
              </motion.button>
            </div>
            <NotebookViewer />
          </motion.div>
        )}

        {/* Selected Movie & Recommendations */}
        {selectedMovie && !showNotebook && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            {/* Selected Movie Hero */}
            <motion.div variants={itemVariants} className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-800/30 mb-8">
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-64 h-80 md:h-auto flex-shrink-0">
                  <img
                    src={selectedMovie.posterUrl}
                    alt={selectedMovie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-emerald-950 via-emerald-950/50 to-transparent" />
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    {selectedMovie.genre.map(g => (
                      <span key={g} className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {g}
                      </span>
                    ))}
                    <span className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                      <Star size={14} weight="fill" />
                      {selectedMovie.rating}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedMovie.title}</h2>
                  <p className="text-emerald-100/60 text-sm mb-2">
                    <Calendar size={14} className="inline mr-1" />
                    {selectedMovie.year} · <Clock size={14} className="inline mr-1" />
                    {selectedMovie.runtime} min · {selectedMovie.streaming}
                  </p>
                  <p className="text-emerald-100/80 text-sm max-w-2xl mb-4 leading-relaxed">
                    {selectedMovie.synopsis}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-emerald-100/60">
                    <Users size={14} />
                    <span className="truncate">{selectedMovie.cast.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <motion.button
                      onClick={handleGetRecommendations}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-600/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Sparkle size={16} weight="fill" />
                      Refresh Recommendations
                    </motion.button>
                    <motion.button
                      onClick={() => setSelectedMovie(null)}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Browse All
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Weight Adjuster */}
            <motion.div variants={itemVariants} className="mb-8">
              <button
                onClick={() => setShowWeights(!showWeights)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
              >
                <Sliders size={16} />
                Feature Weights
                <span className="text-xs text-muted-foreground/60">{showWeights ? '▲' : '▼'}</span>
              </button>
              <AnimatePresence>
                {showWeights && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" as const }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-xl bg-card border border-border grid grid-cols-2 md:grid-cols-5 gap-4">
                      {(Object.keys(DEFAULT_WEIGHTS) as (keyof FeatureWeights)[]).map(feature => (
                        <div key={feature} className="space-y-1">
                          <label className="text-xs capitalize text-muted-foreground">{feature}</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={weights[feature]}
                            onChange={e => handleWeightChange(feature, parseFloat(e.target.value))}
                            className="w-full accent-emerald-500"
                          />
                          <span className="text-xs font-mono text-muted-foreground">{weights[feature].toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Recommendations */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkle className="text-yellow-500" size={22} weight="fill" />
                  Similar Movies
                </h3>
                <span className="text-sm text-muted-foreground">
                  Based on plot, genre, cast & themes
                </span>
              </div>
              {recommendations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkle size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Click "Refresh Recommendations" to find similar movies</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((rec, i) => (
                    <motion.div
                      key={rec.movie.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.4, ease: "easeInOut" as const }}
                      className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-600/5"
                    >
                      <div className="flex">
                        <div className="relative w-24 h-36 flex-shrink-0 overflow-hidden">
                          <img
                            src={rec.movie.posterUrl}
                            alt={rec.movie.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card" />
                        </div>
                        <div className="flex-1 p-3 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm truncate">{rec.movie.title}</h4>
                            <div className="flex items-center gap-1 text-yellow-500 shrink-0">
                              <Star size={11} weight="fill" />
                              <span className="text-xs font-medium">{rec.movie.rating}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {rec.movie.year} · {rec.movie.genre[0]}
                          </p>
                          {/* Score Badge */}
                          <div className="mt-2">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-yellow-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(rec.score * 100, 100)}%` }}
                                  transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: "easeInOut" as const }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {(rec.score * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          {rec.matchingFeatures.length > 0 && (
                            <p className="text-[10px] text-emerald-500/70 mt-1.5 truncate">
                              {rec.matchingFeatures[0]}
                            </p>
                          )}
                          <motion.button
                            onClick={() => handleMovieSelect(rec.movie)}
                            className="mt-2 text-[11px] text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors"
                            whileHover={{ x: 3 }}
                          >
                            Explore <ArrowRight size={11} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Browse All Movies */}
        {!selectedMovie && !showNotebook && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Filters Bar */}
            <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {filters.search ? `Search Results (${filteredMovies.length})` : 'Browse Movies'}
              </h2>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    showFilters || filters.genre || filters.minRating > 0
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-card border border-border hover:bg-accent text-muted-foreground'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sliders size={16} />
                  <span className="hidden sm:inline">Filters</span>
                  {(filters.genre || filters.minRating > 0) && (
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  )}
                </motion.button>
                <span className="text-sm text-muted-foreground">{nollywoodMovies.length} movies</span>
              </div>
            </motion.div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" as const }}
                  className="overflow-hidden mb-6"
                >
                  <div className="p-4 rounded-xl bg-card border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Genre Filter */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Genre</label>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setFilters(f => ({ ...f, genre: null }))}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              !filters.genre
                                ? 'bg-emerald-600 text-white'
                                : 'bg-muted hover:bg-accent text-muted-foreground'
                            }`}
                          >
                            All
                          </button>
                          {nollywoodGenres.map(genre => (
                            <button
                              key={genre}
                              onClick={() => setFilters(f => ({ ...f, genre: f.genre === genre ? null : genre }))}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                filters.genre === genre
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-muted hover:bg-accent text-muted-foreground'
                              }`}
                            >
                              {genre}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Rating Filter */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Min Rating: {filters.minRating.toFixed(1)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.5"
                          value={filters.minRating}
                          onChange={e => setFilters(f => ({ ...f, minRating: parseFloat(e.target.value) }))}
                          className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0</span>
                          <span>5</span>
                        </div>
                      </div>

                      {/* Active Filters */}
                      <div className="flex items-end">
                        {(filters.genre || filters.minRating > 0) && (
                          <motion.button
                            onClick={() => setFilters({ genre: null, minRating: 0, search: '' })}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm hover:bg-destructive/20 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <X size={14} />
                            Clear Filters
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Movie Grid */}
            {filteredMovies.length === 0 ? (
              <motion.div variants={itemVariants} className="text-center py-20">
                <FilmStrip size={64} className="mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-xl font-semibold mb-2">No movies found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                <motion.button
                  onClick={() => setFilters({ genre: null, minRating: 0, search: '' })}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Reset All Filters
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredMovies.map((movie, i) => (
                  <motion.div
                    key={movie.id}
                    variants={itemVariants}
                    custom={i}
                    className="group relative rounded-xl overflow-hidden bg-card border border-border hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-600/5 cursor-pointer"
                    onClick={() => handleMovieSelect(movie)}
                    whileHover={{ y: -4 }}
                  >
                    {/* Poster */}
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.div
                          className="w-12 h-12 rounded-full bg-emerald-600/90 flex items-center justify-center backdrop-blur-sm"
                          whileHover={{ scale: 1.1 }}
                        >
                          <PlayCircle size={22} className="text-white" weight="fill" />
                        </motion.div>
                      </div>
                      {/* Rating Badge */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-yellow-400 text-xs font-medium">
                        <Star size={10} weight="fill" />
                        {movie.rating}
                      </div>
                      {/* Genre Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600/80 backdrop-blur-sm text-white text-[10px] font-medium">
                          {movie.genre[0]}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-semibold text-sm truncate group-hover:text-emerald-500 transition-colors">
                        {movie.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {movie.year} · {movie.runtime}m
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1 truncate">
                        {movie.director}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FilmStrip size={16} className="text-emerald-500" weight="fill" />
            <span>NollyReel — Content-Based Movie Recommender Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <GithubLogo size={16} />
              <span className="hidden sm:inline">Source Code</span>
            </a>
            <button
              onClick={() => {
                toast.success("Downloading dataset...");
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <DownloadSimple size={16} />
              <span className="hidden sm:inline">Dataset</span>
            </button>
            <button
              onClick={() => {
                navigator.share?.({ title: 'NollyReel', text: "Discover Nollywood movies you'll love!" });
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShareNetwork size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;