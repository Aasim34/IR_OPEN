# 🔍 Smart Notes Search Engine

A powerful AI-powered information retrieval system with a modern dark-themed UI, featuring multiple search algorithms, semantic understanding, and advanced document processing capabilities.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Flask](https://img.shields.io/badge/Flask-3.0-green)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![React](https://img.shields.io/badge/React-18.3-cyan)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎯 Advanced Search Algorithms
- **Hybrid Search** - Combines TF-IDF (30%), BM25 (35%), and Semantic (35%) for optimal results
- **BM25 Search** - Advanced ranking algorithm with better relevance scoring
- **TF-IDF Search** - Classic keyword-based matching with term importance weighting
- **Semantic Search** - AI-powered meaning-based search using sentence transformers
- **Query Expansion** - Automatic synonym expansion using WordNet
- **Context Highlighting** - Matched terms highlighted with visual emphasis

### 🎨 Modern UI/UX
- **Dark Elegant Theme** - Sophisticated #030303 background with glassmorphic elements
- **Animated Geometric Shapes** - 5 floating shapes with smooth animations
- **Gradient Effects** - Purple, pink, blue, indigo, and violet color schemes
- **Responsive Design** - Fully optimized for desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion powered transitions and effects
- **Login Page** - Secure authentication interface with the same elegant theme

### 📁 Advanced Features
- **Smart Filtering** - Filter by folders/files with multi-select capability
- **Image Extraction** - Automatic extraction and display of PDF images
- **Key Points Extraction** - AI-powered extraction of relevant bullet points
- **Summary Generation** - Automatic summarization of matched content
- **Score Breakdown** - See individual scores for each search method
- **File Metadata** - Display file size, type, folder, and modification date

### ⚡ Performance Optimization
- **Smart Caching** - Fast startup after first load (2-3 seconds)
- **Auto-Detection** - Automatically detects file changes
- **Lazy Loading** - Optimized component rendering
- **Document Indexing** - Pre-built indices for instant search

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** - Backend processing
- **Node.js 22+** - Frontend development
- **npm 10+** - Package management

### Installation

1. **Navigate to project directory**
   ```bash
   cd A:\IR
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running the Application

**Option 1: One-Command Start (Recommended)**
```powershell
.\start-fullstack.ps1
```

This automatically starts:
- Flask backend at **http://127.0.0.1:5000**
- Next.js frontend at **http://localhost:3000**

**Option 2: Manual Start**

Backend:
```bash
python app.py
```

Frontend (in new terminal):
```bash
cd frontend
npm run dev
```

### First Visit

1. Open **http://localhost:3000**
2. You'll see the elegant login page
3. Enter any credentials and click "Sign In"
4. Redirected to **http://localhost:3000/search** - the main search interface

## 📖 Usage Guide

### Adding Documents

1. Place PDF or text files in `data/docs/` or subfolders
2. Organize by topic (e.g., `AIML/`, `DBMS/`, `IR/`, etc.)
3. Click the reload button (↻) in the interface

### Searching Documents

1. **Enter Search Query**
   - Type your search terms in the search box
   - Query expansion automatically adds synonyms

2. **Select Search Method**
   - **Hybrid** - Best overall results (recommended)
   - **BM25** - Advanced ranking algorithm
   - **TF-IDF** - Classic keyword matching
   - **Semantic** - AI-powered meaning search

3. **Apply Filters (Optional)**
   - Click "Filter by Files/Folders"
   - Select specific folders or files
   - See active filter count

4. **View Results**
   - Match scores (percentage-based)
   - Summary of matched content
   - Key points/concepts highlighted
   - Extracted images from PDFs
   - File metadata (size, date, type)

### Understanding Search Methods

**Hybrid Search (Recommended)**
- Combines: TF-IDF (30%) + BM25 (35%) + Semantic (35%)
- Best for general-purpose searches
- Shows score breakdown for each method

**BM25**
- Advanced probabilistic ranking
- Better handling of document length
- Excellent for precise queries

**TF-IDF**
- Term frequency analysis
- Fast keyword matching
- Good for exact terms

**Semantic**
- AI-powered understanding
- Finds conceptually related content
- Best for complex queries

## 📁 Project Structure

```
A:\IR\
├── app.py                          # Flask backend server
├── requirements.txt                # Python dependencies
├── config.json                     # Search engine configuration
├── start-fullstack.ps1             # Quick start script
├── README.md                       # This file
├── data/
│   └── docs/                       # Your documents (PDFs, TXT)
│       ├── AIML/
│       ├── ARAS/
│       ├── DBMS/
│       ├── DMV/
│       ├── EVS/
│       ├── IR/
│       ├── RM/
│       └── SPM/
├── frontend/                       # Next.js React application
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Login page (/)
│   │   │   ├── search/
│   │   │   │   └── page.tsx       # Search interface (/search)
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Alternative login (/login)
│   │   │   ├── landing/
│   │   │   │   └── page.tsx       # Landing page demo
│   │   │   └── hero-demo/
│   │   │       └── page.tsx       # Hero component demo
│   │   ├── components/
│   │   │   ├── SearchInterface.tsx
│   │   │   ├── ResultCard.tsx
│   │   │   └── ui/
│   │   │       ├── shape-landing-hero.tsx
│   │   │       ├── button.tsx
│   │   │       ├── input.tsx
│   │   │       ├── card.tsx
│   │   │       └── badge.tsx
│   │   └── lib/
│   │       ├── api.ts              # Backend API calls
│   │       └── utils.ts            # Utility functions
├── static/                         # Static assets
├── templates/                      # Flask HTML templates
├── extracted_images/               # PDF image cache
├── document_cache.pkl              # Document cache
└── files_hash.txt                  # File change detection
```

## 🛠️ Technologies Used

### Backend
- **Flask 3.0** - Web framework with CORS support
- **scikit-learn** - TF-IDF vectorization and cosine similarity
- **rank-bm25** - BM25 ranking algorithm
- **sentence-transformers 2.7+** - Semantic search embeddings
- **NLTK** - NLP processing, tokenization, stemming
- **PyPDF2** - PDF text extraction
- **PyMuPDF (fitz)** - PDF image extraction
- **Pillow** - Image processing and optimization
- **NumPy** - Numerical computations

### Frontend
- **Next.js 14.2** - React framework with App Router
- **React 18.3** - UI component library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Radix UI** - Accessible component primitives
- **lucide-react** - Icon library
- **shadcn/ui** - Component architecture

### Design
- **Glassmorphism** - Backdrop blur effects
- **Dark Theme** - #030303 background
- **Gradient Accents** - Purple, pink, blue palette
- **Responsive Layout** - Mobile-first design
- **Smooth Animations** - 60fps transitions

## ⚙️ Configuration

### Backend Settings (`config.json`)

```json
{
  "max_pages_per_pdf": 20,
  "max_images_per_pdf": 3,
  "tfidf_max_features": 1000,
  "hybrid_alpha": 0.5,
  "use_stemming": true,
  "use_lemmatization": false,
  "enable_query_expansion": true,
  "context_window": 150
}
```

### Frontend Settings

- Port: `3000` (Next.js dev server)
- API Endpoint: `http://127.0.0.1:5000`
- Environment: Development mode

### Cache Management

```python
CACHE_FILE = 'document_cache.pkl'
HASH_FILE = 'files_hash.txt'
IMAGE_CACHE_DIR = 'extracted_images/'
```

## 🎨 UI Features

### Login Page (/)
- Elegant dark theme with geometric shapes
- Email and password authentication
- Show/hide password toggle
- Remember me checkbox
- Social login buttons (Google, GitHub)
- Smooth fade-up animations
- Glassmorphic form design

### Search Interface (/search)
- Large animated title with gradient text
- 4 search method buttons with icons
- Real-time search with Enter key support
- File/folder filter dropdown
- Loading indicators
- Error message display
- Animated result cards

### Result Cards
- Match percentage badge
- Score breakdown (TF-IDF, BM25, Semantic)
- Summary section with highlights
- Key points/concepts list
- Image gallery grid
- File metadata footer
- Hover effects and transitions

### Animations
- Floating geometric shapes (continuous loop)
- Staggered fade-in on page load
- Smooth button hover effects
- Card entrance animations
- Loading spinner
- Gradient transitions

## 📊 Search Algorithms Explained

### Hybrid Search (Recommended)
- **Weight Distribution**: TF-IDF (30%) + BM25 (35%) + Semantic (35%)
- **Best For**: General-purpose searches
- **Advantages**: Balanced precision and recall
- **Shows**: Individual scores for each method

### BM25 (Okapi BM25)
- **Algorithm**: Probabilistic ranking function
- **Best For**: Precise keyword searches
- **Advantages**: Better document length normalization
- **Parameters**: k1=1.5, b=0.75 (default)

### TF-IDF (Term Frequency-Inverse Document Frequency)
- **Algorithm**: Statistical measure of importance
- **Best For**: Exact term matching
- **Advantages**: Fast and efficient
- **Features**: Max 1000 features

### Semantic Search
- **Model**: all-MiniLM-L6-v2 (sentence transformers)
- **Best For**: Conceptual/meaning-based queries
- **Advantages**: Understands context and synonyms
- **Encoding**: 384-dimensional embeddings

### Query Processing
- **Tokenization**: NLTK punkt tokenizer
- **Stopword Removal**: English stopwords + custom IR terms
- **Stemming**: Porter Stemmer (optional)
- **Expansion**: WordNet synonym expansion
- **Context Window**: 150 characters around matches

## 🔧 Troubleshooting

### Backend Issues

**App won't start**
- Check Python version: `python --version` (need 3.11+)
- Reinstall dependencies: `pip install -r requirements.txt`
- Delete cache: `document_cache.pkl`, `files_hash.txt`

**No documents found**
- Verify files in `data/docs/` folder
- Check file extensions (.pdf or .txt)
- Click reload button (↻)
- Check console for errors

**Images not showing**
- Install PyMuPDF: `pip install PyMuPDF`
- Delete cache and reload
- Verify PDF has embedded images

### Frontend Issues

**Frontend won't start**
- Check Node version: `node --version` (need 22+)
- Reinstall: `cd frontend; npm install`
- Clear cache: `rm -rf .next`

**Memory allocation error**
- Restart the development server
- Close other applications
- Increase Node memory: `set NODE_OPTIONS=--max_old_space_size=4096`

**CORS errors**
- Verify backend is running on port 5000
- Check `flask-cors` is installed
- Clear browser cache

### Performance Issues

**Slow first load**
- Normal: Building indices takes time
- Subsequent loads use cache (2-3 seconds)
- Reduce documents or max_pages setting

**Search taking long**
- Check document count
- Reduce tfidf_max_features in config
- Disable semantic search if not needed

## 📝 Features Completed

### ✅ Implemented
- [x] Multiple search algorithms (TF-IDF, BM25, Semantic, Hybrid)
- [x] Modern dark-themed UI with animations
- [x] Login page with authentication flow
- [x] Advanced file/folder filtering
- [x] PDF image extraction and display
- [x] Smart caching system
- [x] Query expansion with synonyms
- [x] Key points extraction
- [x] Summary generation
- [x] Responsive design (mobile/tablet/desktop)
- [x] Score breakdown display
- [x] File metadata display
- [x] Highlight matched terms
- [x] Context window extraction

### 🔄 Planned Enhancements
- [ ] User authentication backend
- [ ] Document upload interface
- [ ] Advanced query syntax (AND, OR, NOT)
- [ ] Search history tracking
- [ ] Export results (PDF, CSV)
- [ ] Document preview modal
- [ ] OCR for scanned PDFs
- [ ] Multi-language support
- [ ] Real-time collaborative search
- [ ] API documentation
- [ ] Docker containerization
- [ ] Cloud deployment (Vercel/Heroku)

## 📄 License

MIT License - feel free to use this project for educational purposes.

## 👨‍💻 Developer

Created for Information Retrieval coursework - December 2025

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **shadcn/ui** - Component library
- **scikit-learn** - Machine learning tools
- **sentence-transformers** - Semantic embeddings
- **Flask** - Python web framework
- **PyMuPDF** - PDF processing
- **NLTK** - Natural language toolkit

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Verify all dependencies installed
3. Check console for error messages
4. Clear cache and restart servers
5. Review file permissions

## 🚀 Quick Reference

**Start Application:**
```powershell
.\start-fullstack.ps1
```

**Access Points:**
- Login: http://localhost:3000
- Search: http://localhost:3000/search
- Landing Demo: http://localhost:3000/landing
- Hero Demo: http://localhost:3000/hero-demo
- Backend API: http://127.0.0.1:5000

**Key Commands:**
- Backend: `python app.py`
- Frontend: `cd frontend; npm run dev`
- Build: `cd frontend; npm run build`

---

**Made with ❤️ using Next.js, React, Flask, and AI**
#   I R _ O P E N  
 