# Smart Notes Search Engine - Next.js Frontend

## Installation

```bash
cd frontend
npm install
```

## Running the Application

### 1. Start the Flask Backend (Terminal 1)
```bash
cd A:\IR
python app.py
```
The backend will run on http://127.0.0.1:5000

### 2. Start the Next.js Frontend (Terminal 2)
```bash
cd A:\IR\frontend
npm run dev
```
The frontend will run on http://localhost:3000

## Features

- ✨ Modern UI with animated background paths
- 🔍 4 search methods: Hybrid, BM25, TF-IDF, Semantic
- 📁 File and folder filtering
- 📊 Detailed result cards with summaries, key points, and images
- 🌙 Dark mode support
- 📱 Fully responsive design
- ⚡ Built with Next.js 14, TypeScript, and Tailwind CSS

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   └── background-paths.tsx
│   │   ├── SearchInterface.tsx
│   │   └── ResultCard.tsx
│   └── lib/
│       ├── utils.ts
│       └── api.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Configuration

The API URL defaults to `http://127.0.0.1:5000`. To change it, create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://your-backend-url:5000
```

## Build for Production

```bash
npm run build
npm start
```
