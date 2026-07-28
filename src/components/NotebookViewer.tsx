import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, CopySimple, Check, PlayCircle, Terminal, BookOpenText } from '@phosphor-icons/react';
import { NotebookSection } from '../types';
import { toast } from 'sonner';

const notebookSections: NotebookSection[] = [
  {
    title: "1. Import Libraries",
    code: `import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import matplotlib.pyplot as plt
import seaborn as sns`,
    description: "Load core ML libraries for text processing, vectorization, and similarity computation."
  },
  {
    title: "2. Load & Explore Dataset",
    code: `# Load Nollywood movie dataset
df = pd.read_csv('nollywood_movies.csv')
print(f"Dataset shape: {df.shape}")
print(f"Genres: {df['genre'].nunique()}")
print(f"Movies: {df['title'].nunique()}")
df.head()`,
    description: "Explore the Nollywood movie catalog with 40+ films across diverse genres."
  },
  {
    title: "3. Build TF-IDF Vectors",
    code: `# Combine text features into a single corpus
df['combined_features'] = (
    df['synopsis'] + ' ' +
    df['genre'] + ' ' +
    df['cast'] + ' ' +
    df['director'] + ' ' +
    df['keywords']
)

# Create TF-IDF matrix
tfidf = TfidfVectorizer(
    stop_words='english',
    max_features=5000,
    ngram_range=(1, 2)
)
tfidf_matrix = tfidf.fit_transform(df['combined_features'])
print(f"TF-IDF matrix shape: {tfidf_matrix.shape}")`,
    description: "Transform movie text features into numerical TF-IDF vectors for similarity computation."
  },
  {
    title: "4. Compute Cosine Similarity",
    code: `# Compute pairwise cosine similarity
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Create a Series for easy lookup
indices = pd.Series(
    df.index, index=df['title']
).drop_duplicates()

print(f"Similarity matrix shape: {cosine_sim.shape}")
print(f"Similarity range: [{cosine_sim.min():.3f}, {cosine_sim.max():.3f}]")`,
    description: "Calculate cosine similarity between all movie pairs, forming the recommendation foundation."
  },
  {
    title: "5. Recommendation Engine",
    code: `def recommend_movies(title, cosine_sim=cosine_sim, top_n=6):
    """Get top-N movie recommendations based on content similarity."""
    idx = indices[title]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(
        sim_scores, key=lambda x: x[1], reverse=True
    )
    sim_scores = sim_scores[1:top_n+1]
    movie_indices = [i[0] for i in sim_scores]
    scores = [i[1] for i in sim_scores]

    results = df.iloc[movie_indices][['title', 'genre', 'rating']]
    results['similarity_score'] = [round(s, 3) for s in scores]
    return results

# Example: Get recommendations for "The Wedding Party"
recommendations = recommend_movies("The Wedding Party")
print(recommendations)`,
    description: "The core recommendation function — find movies most similar to any given title."
  },
  {
    title: "6. Visualize Results",
    code: `# Visualize recommendation scores
plt.figure(figsize=(10, 6))
colors = plt.cm.Greens(
    np.linspace(0.3, 0.9, len(recommendations))
)

plt.barh(
    recommendations['title'],
    recommendations['similarity_score'],
    color=colors
)
plt.xlabel('Similarity Score')
plt.title('Top Movie Recommendations')
plt.gca().invert_yaxis()
plt.tight_layout()
plt.show()`,
    description: "Bar chart visualization of recommendation scores for easy comparison."
  },
  {
    title: "7. Try It Yourself!",
    code: `# Pick any movie from the dataset
your_movie = "October 1"
results = recommend_movies(your_movie)
print(f"Recommendations for '{your_movie}':")
print(results)

# Or search by genre filter
action_movies = df[df['genre'].str.contains('Action', case=False)]
print(f"\
Action movies available: {len(action_movies)}")
print(action_movies[['title', 'year', 'rating']])`,
    description: "Experiment with different movies and explore genre-specific recommendations."
  }
];

export default function NotebookViewer() {
  const [activeSection, setActiveSection] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [runState, setRunState] = useState<Record<number, 'idle' | 'running' | 'complete'>>({});

  const handleCopy = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleRun = (index: number) => {
    setRunState(prev => ({ ...prev, [index]: 'running' }));
    setTimeout(() => {
      setRunState(prev => ({ ...prev, [index]: 'complete' }));
      toast.success(`Section "${notebookSections[index].title}" executed!`);
    }, 1500);
  };

  const section = notebookSections[activeSection];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <BookOpenText className="text-emerald-500" weight="fill" size={28} />
          Interactive Notebook
        </h2>
        <p className="text-muted-foreground mt-1">
          Explore the recommendation engine, step by step. Each cell contains working Python code.
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
        {notebookSections.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => setActiveSection(i)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeSection === i
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {s.title}
            {runState[i] === 'complete' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <Check size={10} weight="bold" />
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Active Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-card border border-border rounded-xl overflow-hidden shadow-lg"
        >
          {/* Section Header */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Terminal className="text-emerald-500" size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => handleRun(activeSection)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={runState[activeSection] === 'running'}
                >
                  {runState[activeSection] === 'running' ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                    >
                      <Terminal size={16} />
                    </motion.span>
                  ) : (
                    <PlayCircle size={16} weight="fill" />
                  )}
                  {runState[activeSection] === 'running' ? 'Running...' : 'Run'}
                </motion.button>
                <motion.button
                  onClick={() => handleCopy(section.code, activeSection)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Copy code"
                >
                  {copiedIndex === activeSection ? (
                    <Check size={18} className="text-emerald-500" weight="bold" />
                  ) : (
                    <CopySimple size={18} />
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Code Block */}
          <div className="relative">
            <div className="absolute top-3 left-4 flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <pre className="p-6 pt-10 overflow-x-auto bg-[#0f1117] text-sm leading-relaxed">
              <code className="text-gray-100 font-mono">{section.code}</code>
            </pre>
          </div>

          {/* Output Simulation */}
          {runState[activeSection] === 'complete' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-border bg-muted/20"
            >
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-emerald-500 mb-2">
                  <Check size={16} weight="bold" />
                  <span className="font-medium">Output</span>
                </div>
                <div className="text-sm text-muted-foreground font-mono bg-background/50 rounded-lg p-3 border border-border">
                  <span className="text-emerald-400">✓</span> Section "{section.title}" executed successfully.
                  <br />
                  <span className="text-gray-500"># Ready for next step</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-600 to-yellow-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(Object.values(runState).filter(s => s === 'complete').length / notebookSections.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {Object.values(runState).filter(s => s === 'complete').length} / {notebookSections.length} complete
        </span>
      </div>
    </div>
  );
}