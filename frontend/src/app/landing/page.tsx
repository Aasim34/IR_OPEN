"use client"

import { HeroGeometric } from "@/components/ui/shape-landing-hero"
import { Button } from "@/components/ui/button"
import { Search, FileText, Zap, Brain } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function AlternativeLanding() {
  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Hero Section with Geometric Shapes */}
      <section className="relative">
        <div className="absolute inset-0">
          <HeroGeometric 
            badge="Smart Notes Search Engine"
            title1="Find Anything"
            title2="In Your Notes"
          />
        </div>
        
        {/* CTA Button */}
        <div className="relative z-20 flex justify-center items-end min-h-screen pb-20">
          <Link href="/">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white px-8 py-6 text-lg font-semibold shadow-2xl"
            >
              <Search className="mr-2 h-5 w-5" />
              Start Searching Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 bg-gradient-to-b from-[#030303] to-black py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
          >
            Powerful Search Features
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="bg-indigo-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Brain className="h-7 w-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI-Powered Search</h3>
              <p className="text-white/60 leading-relaxed">
                Advanced semantic search understands context and meaning, not just keywords.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="bg-rose-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-7 w-7 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-white/60 leading-relaxed">
                Get instant results with cached indexing and optimized search algorithms.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="bg-violet-500/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Format Support</h3>
              <p className="text-white/60 leading-relaxed">
                Search across PDFs and text files with automatic text extraction.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 bg-black py-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to find what you need?
          </h2>
          <p className="text-white/60 mb-8 text-lg">
            Upload your documents and start searching with our powerful AI engine.
          </p>
          <Link href="/">
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg"
            >
              Get Started Free
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
