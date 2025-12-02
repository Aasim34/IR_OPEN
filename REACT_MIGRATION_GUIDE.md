# React/Next.js Migration Guide for Smart Notes Search Engine

## Overview
This guide explains how to integrate the BackgroundPaths component into your IR system by creating a React/Next.js frontend.

---

## Setup Instructions

### 1. Create Next.js Project with TypeScript

```bash
# Navigate to IR directory
cd A:\IR

# Create new Next.js app in a subdirectory
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*"

# Navigate to frontend
cd frontend
```

When prompted, select:
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ App Router
- ✅ src/ directory
- ✅ Import alias (@/*)

---

### 2. Install shadcn/ui

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# When prompted:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

This creates:
- `components/ui/` folder (default shadcn location)
- `lib/utils.ts` with cn() helper
- `components.json` config file

---

### 3. Install Required Dependencies

```bash
npm install framer-motion @radix-ui/react-slot class-variance-authority lucide-react clsx tailwind-merge
```

**Dependency breakdown:**
- `framer-motion` - Animation library for path animations
- `@radix-ui/react-slot` - Required by shadcn Button component
- `class-variance-authority` - Type-safe variant styling
- `lucide-react` - Icon library (optional, for future icons)
- `clsx` + `tailwind-merge` - Utility for merging Tailwind classes

---

### 4. Create Component Files

#### a. Create Button Component
**Path:** `frontend/src/components/ui/button.tsx`

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### b. Create BackgroundPaths Component
**Path:** `frontend/src/components/ui/background-paths.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

function FloatingPaths({ position }: { position: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(15,23,42,${0.1 + i * 0.03})`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-slate-950 dark:text-white"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.03}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 20 + Math.random() * 10,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function BackgroundPaths({
    title = "Background Paths",
}: {
    title?: string;
}) {
    const words = title.split(" ");

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
            <div className="absolute inset-0">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-4 last:mr-0"
                            >
                                {word.split("").map((letter, letterIndex) => (
                                    <motion.span
                                        key={`${wordIndex}-${letterIndex}`}
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            delay:
                                                wordIndex * 0.1 +
                                                letterIndex * 0.03,
                                            type: "spring",
                                            stiffness: 150,
                                            damping: 25,
                                        }}
                                        className="inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-neutral-900 to-neutral-700/80 
                                        dark:from-white dark:to-white/80"
                                    >
                                        {letter}
                                    </motion.span>
                                ))}
                            </span>
                        ))}
                    </h1>

                    <div
                        className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
                        dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                        overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                    >
                        <Button
                            variant="ghost"
                            className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                            bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 
                            text-black dark:text-white transition-all duration-300 
                            group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                            hover:shadow-md dark:hover:shadow-neutral-800/50"
                        >
                            <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                                Discover Excellence
                            </span>
                            <span
                                className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                transition-all duration-300"
                            >
                                →
                            </span>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
```

#### c. Verify lib/utils.ts exists
**Path:** `frontend/src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

### 5. Integrate into Your Search Page

**Path:** `frontend/src/app/page.tsx`

```tsx
import { BackgroundPaths } from "@/components/ui/background-paths"

export default function Home() {
  return (
    <BackgroundPaths title="Smart Notes Search Engine" />
  )
}
```

---

### 6. Update Tailwind Config (if needed)

**Path:** `frontend/tailwind.config.ts`

Ensure it includes:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... other shadcn colors
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

---

### 7. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Integration with Flask Backend

### Architecture:
```
A:\IR\
├── app.py              # Flask API backend (port 5000)
├── frontend/           # Next.js frontend (port 3000)
│   ├── src/
│   │   ├── app/
│   │   ├── components/ui/
│   │   └── lib/
│   └── package.json
```

### API Integration:

Create API service in Next.js:

**Path:** `frontend/src/lib/api.ts`

```typescript
const API_URL = 'http://127.0.0.1:5000';

export async function searchDocuments(
  query: string,
  searchType: 'hybrid' | 'bm25' | 'tfidf' | 'semantic',
  filterFiles: string[] = []
) {
  const response = await fetch(`${API_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, search_type: searchType, filter_files: filterFiles }),
  });
  
  if (!response.ok) throw new Error('Search failed');
  return response.json();
}

export async function getFiles() {
  const response = await fetch(`${API_URL}/get_files`);
  return response.json();
}

export async function reloadDocuments() {
  const response = await fetch(`${API_URL}/reload`, { method: 'POST' });
  return response.json();
}
```

---

## Why components/ui Folder?

The `components/ui/` folder is **essential** for shadcn because:

1. **Convention**: shadcn CLI automatically installs components here
2. **Separation**: Separates primitive UI components from feature components
3. **Reusability**: UI primitives (Button, Input, etc.) are reusable across features
4. **Import paths**: Components reference each other via `@/components/ui/*`
5. **Updates**: When you run `npx shadcn@latest add button`, it goes to `components/ui/button.tsx`

**Folder structure:**
```
src/
├── components/
│   ├── ui/              # Shadcn primitives (Button, Input, etc.)
│   │   ├── button.tsx
│   │   ├── background-paths.tsx
│   │   └── ...
│   ├── search/          # Feature components
│   │   ├── SearchBox.tsx
│   │   ├── ResultCard.tsx
│   │   └── ...
│   └── layout/          # Layout components
│       ├── Header.tsx
│       └── ...
```

---

## Component Customization for Your IR System

### Custom Search Page with BackgroundPaths:

**Path:** `frontend/src/app/search/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchDocuments } from "@/lib/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const data = await searchDocuments(query, "hybrid");
    setResults(data.results);
  };

  return (
    <div className="relative min-h-screen">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <BackgroundPaths title="" />
      </div>

      {/* Search interface */}
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-8">
          🔍 Smart Notes Search Engine
        </h1>
        
        <div className="max-w-2xl mx-auto mb-12">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query..."
            className="mb-4"
          />
          <Button onClick={handleSearch} className="w-full">
            Search
          </Button>
        </div>

        {/* Results here */}
      </div>
    </div>
  );
}
```

---

## Quick Start Commands

```bash
# 1. Create Next.js project
cd A:\IR
npx create-next-app@latest frontend --typescript --tailwind --app

# 2. Install dependencies
cd frontend
npm install framer-motion @radix-ui/react-slot class-variance-authority lucide-react clsx tailwind-merge

# 3. Initialize shadcn
npx shadcn@latest init

# 4. Copy component files (use the code above)

# 5. Run both servers
# Terminal 1: Flask backend
cd A:\IR
python app.py

# Terminal 2: Next.js frontend
cd A:\IR\frontend
npm run dev
```

---

## Alternative: Keep Current Setup

If you want to keep your Flask/Vanilla JS setup, I can convert the BackgroundPaths animation to vanilla JavaScript/CSS instead of React.

Would you like me to:
1. **Create the React/Next.js setup** (recommended for this component)
2. **Convert to vanilla JS/CSS** for your current Flask app
