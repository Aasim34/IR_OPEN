"use client";

import Link from "next/link";
import { DottedSurface } from "@/components/ui/dotted-surface";
import { GlareCard } from "@/components/ui/glare-card";
import { Search, Upload, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-8">
      <DottedSurface className="fixed inset-0" />
      
      <div className="relative z-10 max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeInUp">
          <h1 className="text-6xl font-bold mb-4">
            Smart PDF Search Engine
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Advanced Information Retrieval with AI-Powered Search
          </p>
          <p className="text-muted-foreground">
            Upload documents and search through them with multiple algorithms
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 justify-items-center">
          {/* Search Card */}
          <Link
            href="/search"
            className="animate-slideInLeft"
            style={{animationDelay: '0.2s'}}
          >
            <GlareCard className="flex flex-col items-center justify-center p-8">
              <div className="flex flex-col items-center text-center h-full justify-between">
                <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-6">
                  <Search className="w-12 h-12 text-white" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-white">Search Documents</h2>
                  
                  <p className="text-gray-300 mb-6">
                    Search through your document collection using advanced algorithms.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">Semantic</span>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">BM25</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">TF-IDF</span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Hybrid</span>
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/20 transition-colors">
                  Start Searching →
                </div>
              </div>
            </GlareCard>
          </Link>

          {/* AI Chat Card */}
          <Link
            href="/ai-chat"
            className="animate-fadeInUp"
            style={{animationDelay: '0.3s'}}
          >
            <GlareCard className="flex flex-col items-center justify-center p-8">
              <div className="flex flex-col items-center text-center h-full justify-between">
                <div className="p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-white">AI Assistant</h2>
                  
                  <p className="text-gray-300 mb-6">
                    Ask questions and get AI-powered answers from your documents with sources.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">Conversational</span>
                    <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">Context-Aware</span>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm">Smart</span>
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/20 transition-colors">
                  Chat with AI →
                </div>
              </div>
            </GlareCard>
          </Link>

          {/* Upload Card */}
          <Link
            href="/upload"
            className="animate-slideInRight"
            style={{animationDelay: '0.4s'}}
          >
            <GlareCard className="flex flex-col items-center justify-center p-8">
              <div className="flex flex-col items-center text-center h-full justify-between">
                <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-6">
                  <Upload className="w-12 h-12 text-white" />
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-white">Upload Documents</h2>
                  
                  <p className="text-gray-300 mb-6">
                    Upload files to add them to the searchable collection.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">PDF</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">TXT</span>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm">DOC</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">DOCX</span>
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/20 transition-colors">
                  Upload Files →
                </div>
              </div>
            </GlareCard>
          </Link>
        </div>

        {/* Features Section */}
        <div className="text-center animate-fadeInUp" style={{animationDelay: '0.6s'}}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Powered by Advanced AI & Machine Learning</span>
          </div>
        </div>
      </div>
    </main>
  );
}
