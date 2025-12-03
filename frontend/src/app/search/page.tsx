"use client";

import { DottedSurface } from "@/components/ui/dotted-surface";
import { useState, useEffect } from "react";
import { Search, Sparkles, Zap, FileText, GitMerge, FolderOpen, X, ExternalLink } from "lucide-react";

type SearchType = "semantic" | "bm25" | "tfidf" | "hybrid";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("hybrid");
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterSearchQuery, setFilterSearchQuery] = useState("");

  // Fetch available files and folders on component mount
  useEffect(() => {
    const fetchFilesAndFolders = async () => {
      try {
        const response = await fetch("http://localhost:5000/get_files");
        const data = await response.json();
        setAvailableFolders(data.folders || []);
        setAvailableFiles(data.files || []);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFilesAndFolders();
  }, []);

  const searchAlgorithms = [
    {
      id: "semantic" as SearchType,
      name: "Semantic",
      description: "AI-powered contextual search",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "bm25" as SearchType,
      name: "BM25",
      description: "Advanced probabilistic ranking",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "tfidf" as SearchType,
      name: "TF-IDF",
      description: "Classic term frequency analysis",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "hybrid" as SearchType,
      name: "Hybrid",
      description: "Best of all algorithms combined",
      icon: GitMerge,
      color: "from-green-500 to-emerald-500",
    },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          search_type: searchType,
          filter_files: selectedFilters,
        }),
      });

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const filteredFolders = availableFolders.filter(folder =>
    folder.toLowerCase().includes(filterSearchQuery.toLowerCase())
  );

  const filteredFiles = availableFiles.filter(file =>
    file.toLowerCase().includes(filterSearchQuery.toLowerCase())
  );

  const handleOpenFile = async (filename: string) => {
    try {
      // Request file from backend
      const response = await fetch(`http://localhost:5000/download/${encodeURIComponent(filename)}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  return (
    <div className="relative min-h-screen">
      <DottedSurface className="fixed inset-0" />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <h1 className="text-5xl font-bold mb-4">
            Smart PDF Search Engine
          </h1>
          <p className="text-muted-foreground text-lg">
            Search through your document collection with advanced AI
          </p>
        </div>

        {/* Search Algorithm Selection */}
        <div className="max-w-5xl mx-auto mb-8 animate-slideInLeft" style={{animationDelay: '0.2s'}}>
          <h3 className="text-sm font-medium mb-4 text-center text-muted-foreground">
            Select Search Algorithm
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {searchAlgorithms.map((algo) => {
              const Icon = algo.icon;
              const isSelected = searchType === algo.id;
              
              return (
                <button
                  key={algo.id}
                  onClick={() => setSearchType(algo.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-lg scale-105"
                      : "border-border bg-card/50 hover:border-primary/50 hover:bg-card/80"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${algo.color} ${
                        isSelected ? "opacity-100" : "opacity-70"
                      }`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-sm mb-1">{algo.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {algo.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12 animate-slideInRight" style={{animationDelay: '0.4s'}}>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query..."
              className="w-full px-6 py-4 pl-14 text-lg bg-background/80 backdrop-blur-sm border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* File Filter Section */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:border-primary/50 transition text-sm"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Filter by Files/Folders</span>
                {selectedFilters.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs">
                    {selectedFilters.length}
                  </span>
                )}
              </button>
              
              {selectedFilters.length > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Selected Filters Display */}
            {selectedFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedFilters.map((filter) => (
                  <div
                    key={filter}
                    className="flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/20 rounded-lg text-sm"
                  >
                    <span className="truncate max-w-xs">{filter}</span>
                    <button
                      type="button"
                      onClick={() => toggleFilter(filter)}
                      className="hover:bg-primary/20 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Dropdown with Folders and Files */}
            {showFilterDropdown && (
              <div className="mt-2 p-4 bg-card/80 backdrop-blur-sm border border-border rounded-xl max-h-96 overflow-y-auto">
                {/* Search within filters */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={filterSearchQuery}
                      onChange={(e) => setFilterSearchQuery(e.target.value)}
                      placeholder="Search folders or files..."
                      className="w-full px-4 py-2 pl-10 text-sm bg-background/80 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Folders Section */}
                {filteredFolders.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      Folders ({filteredFolders.length})
                    </h4>
                    <div className="space-y-1">
                      {filteredFolders.map((folder) => (
                        <label
                          key={folder}
                          className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(folder)}
                            onChange={() => toggleFilter(folder)}
                            className="rounded"
                          />
                          <span className="text-sm truncate">{folder}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Files Section */}
                {filteredFiles.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Individual Files ({filteredFiles.length})
                    </h4>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {filteredFiles.slice(0, 50).map((file) => (
                        <label
                          key={file}
                          className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(file)}
                            onChange={() => toggleFilter(file)}
                            className="rounded"
                          />
                          <span className="text-xs truncate">{file}</span>
                        </label>
                      ))}
                      {filteredFiles.length > 50 && (
                        <p className="text-xs text-muted-foreground p-2">
                          Showing first 50 files. Use search to narrow results.
                        </p>
                      )}
                      {filterSearchQuery && filteredFiles.length === 0 && filteredFolders.length === 0 && (
                        <p className="text-sm text-muted-foreground p-2 text-center">
                          No files or folders match your search.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-6 animate-slideDown">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                Found {results.length} results
              </h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${
                  searchAlgorithms.find(a => a.id === searchType)?.color
                }`} />
                <span className="text-sm font-medium">
                  Using {searchAlgorithms.find(a => a.id === searchType)?.name}
                </span>
              </div>
            </div>
            {results.map((result, idx) => (
              <div
                key={idx}
                style={{ animationDelay: `${idx * 0.1}s` }}
                className="p-6 bg-card/80 backdrop-blur-sm border border-border rounded-xl hover:shadow-lg transition-shadow animate-slideDown"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{result.filename}</h3>
                      <button
                        onClick={() => handleOpenFile(result.filename)}
                        className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors group/btn"
                        title="Open file"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {result.file_type && (
                        <span className="px-2 py-1 bg-primary/10 rounded">
                          {result.file_type}
                        </span>
                      )}
                      {result.folder && (
                        <span>📁 {result.folder}</span>
                      )}
                      {result.file_size && (
                        <span>💾 {result.file_size}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full font-medium">
                      {(result.score * 100).toFixed(1)}% match
                    </span>
                    {result.method && (
                      <span className="text-xs text-muted-foreground">
                        via {result.method}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className="text-muted-foreground mb-4 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: result.summary }}
                />
                {result.key_points && result.key_points.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-border/50">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <span className="w-1 h-4 bg-primary rounded" />
                      Key Points
                    </h4>
                    <ul className="space-y-2">
                      {result.key_points.map((point: string, i: number) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground pl-4 border-l-2 border-border/50 py-1"
                          dangerouslySetInnerHTML={{ __html: point }}
                        />
                      ))}
                    </ul>
                  </div>
                )}
                {result.images && result.images.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <h4 className="font-medium text-sm mb-3">Document Images</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {result.images.map((img: string, i: number) => (
                        <div
                          key={i}
                          className="relative group overflow-hidden rounded-lg border border-border/50 bg-muted/20"
                        >
                          <img
                            src={`data:image/png;base64,${img}`}
                            alt={`Document image ${i + 1}`}
                            className="w-full h-auto object-contain max-h-64 transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try a different query or select another search algorithm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
