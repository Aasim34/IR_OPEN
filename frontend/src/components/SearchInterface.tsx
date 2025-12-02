"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, RotateCw, Folder, Sparkles, Zap, BarChart3, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchDocuments, getFiles, reloadDocuments, type SearchResult } from "@/lib/api";
import { ResultCard } from "@/components/ResultCard";

type SearchType = "hybrid" | "bm25" | "tfidf" | "semantic";

const searchMethods = [
  { value: "hybrid" as const, label: "Hybrid (Best Results)", icon: Sparkles },
  { value: "bm25" as const, label: "BM25 (Advanced Ranking)", icon: Zap },
  { value: "tfidf" as const, label: "TF-IDF (Keyword Match)", icon: BarChart3 },
  { value: "semantic" as const, label: "Semantic (Meaning-Based)", icon: Brain },
];

export function SearchInterface() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("hybrid");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docCount, setDocCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const data = await getFiles();
      setFolders(data.folders || []);
      setFiles(data.files || []);
      setDocCount(data.files?.length || 0);
    } catch (err) {
      console.error("Failed to load files:", err);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchDocuments(query, searchType, selectedFilters);
      setResults(data.results);
      if (data.results.length === 0) {
        setError("No results found for your query");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReload = async () => {
    try {
      const data = await reloadDocuments();
      setDocCount(data.doc_count);
      await loadFiles();
    } catch (err) {
      setError("Failed to reload documents");
    }
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 md:mb-16"
      >
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6 md:mb-8"
        >
          <div className="h-2 w-2 rounded-full bg-pink-500/80" />
          <span className="text-sm text-white/60 tracking-wide">
            AI-Powered Search Engine
          </span>
        </motion.div>

        <motion.div
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
              Smart Notes
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300">
              Search Engine
            </span>
          </h1>
        </motion.div>

        <motion.div
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <p className="text-base sm:text-lg md:text-xl text-white/40 mb-6 leading-relaxed font-light tracking-wide max-w-2xl mx-auto">
            Search through your notes using TF-IDF & Semantic Similarity
          </p>
        </motion.div>

        <motion.div
          custom={3}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-center gap-4"
        >
          <Badge className="text-sm bg-white/[0.05] text-white/70 border-white/[0.1] hover:bg-white/[0.08]">
            {docCount} documents loaded
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleReload}
            title="Reload documents"
            className="text-white/60 hover:text-white hover:bg-white/[0.05]"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.header>

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="mb-8 backdrop-blur-xl bg-white/[0.03] rounded-2xl p-6 shadow-2xl border border-white/[0.08]"
      >
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter your search query..."
            className="flex-1 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/40 focus:border-purple-400/50 focus:ring-purple-400/20"
          />
          <Button 
            onClick={handleSearch} 
            disabled={loading} 
            className="min-w-[100px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
          >
            {loading ? (
              <RotateCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>

        {/* Search Methods */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {searchMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.value}
                onClick={() => setSearchType(method.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  searchType === method.value
                    ? "border-purple-500/50 bg-purple-500/10 text-white"
                    : "border-white/[0.1] text-white/60 hover:border-purple-400/30 hover:bg-white/[0.02]"
                }`}
              >
                <Icon className="h-5 w-5 mx-auto mb-1" />
                <div className="text-xs font-medium text-center">
                  {method.label.split(" ")[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Filter Button */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full bg-white/[0.03] border-white/[0.1] text-white hover:bg-white/[0.05] hover:text-white"
        >
          <Folder className="h-4 w-4 mr-2" />
          Filter by Files/Folders
          {selectedFilters.length > 0 && (
            <Badge className="ml-2 bg-purple-500/20 text-purple-300 border-purple-400/30">
              {selectedFilters.length}
            </Badge>
          )}
        </Button>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-4 border border-white/[0.1] rounded-lg bg-white/[0.02] max-h-64 overflow-y-auto"
          >
            <h4 className="font-semibold mb-2 text-white">Folders</h4>
            {folders.map((folder) => (
              <label key={folder} className="flex items-center gap-2 mb-1 cursor-pointer hover:bg-white/[0.02] p-1 rounded">
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(folder)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFilters([...selectedFilters, folder]);
                    } else {
                      setSelectedFilters(selectedFilters.filter((f) => f !== folder));
                    }
                  }}
                  className="accent-purple-500"
                />
                <span className="text-sm text-white/70">{folder}</span>
              </label>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-400/30 rounded-lg text-red-300 backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-white">
            Found {results.length} result(s) for "{query}"
          </h2>
          {results.map((result, index) => (
            <ResultCard key={index} result={result} index={index} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
