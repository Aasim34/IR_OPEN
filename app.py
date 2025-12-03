from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import os
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2
import nltk
from nltk.corpus import stopwords, wordnet
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer, WordNetLemmatizer
import pickle
import hashlib
import io
import base64
from PIL import Image
from rank_bm25 import BM25Okapi
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Load configuration
CONFIG = {
    'max_pages_per_pdf': 10,
    'max_images_per_pdf': 3,
    'tfidf_max_features': 1000,
    'hybrid_alpha': 0.5,  # Weight for TF-IDF in hybrid (1-alpha for semantic)
    'use_stemming': True,
    'use_lemmatization': False,
    'enable_query_expansion': True,
    'context_window': 150
}

# Try to load config.json if exists
config_path = os.path.join(r'A:\IR', 'config.json')
if os.path.exists(config_path):
    try:
        with open(config_path, 'r') as f:
            CONFIG.update(json.load(f))
    except:
        pass

# Initialize NLP tools
stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

# Try to load semantic model
SEMANTIC_MODEL = None
SEMANTIC_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer
    SEMANTIC_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
    SEMANTIC_AVAILABLE = True
    print("✅ Semantic search enabled!")
except Exception as e:
    print(f"⚠️ Semantic search disabled: {e}")
    SEMANTIC_AVAILABLE = False

# Global variables to store documents
documents = []
doc_names = []
doc_images = []  # Store images for each document
doc_metadata = []  # Store file size, modified time, etc.
processed_docs = []  # Tokenized and preprocessed docs for BM25
tfidf_vectorizer = None
tfidf_matrix = None
bm25_model = None
semantic_embeddings = None

# Cache settings
BASE_DIR = r'A:\IR'
CACHE_FILE = os.path.join(BASE_DIR, 'document_cache.pkl')
HASH_FILE = os.path.join(BASE_DIR, 'files_hash.txt')
IMAGE_CACHE_DIR = os.path.join(BASE_DIR, 'extracted_images')

# Create image cache directory
if not os.path.exists(IMAGE_CACHE_DIR):
    os.makedirs(IMAGE_CACHE_DIR)

def preprocess_text_advanced(text):
    """Advanced preprocessing with stemming/lemmatization"""
    # Lowercase
    text = text.lower()
    
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    # Add custom IR-specific stopwords
    custom_stops = {'note', 'notes', 'question', 'answer', 'section', 'unit', 'page'}
    stop_words.update(custom_stops)
    
    tokens = [t for t in tokens if t not in stop_words and len(t) > 2]
    
    # Apply stemming or lemmatization
    if CONFIG.get('use_stemming'):
        tokens = [stemmer.stem(t) for t in tokens]
    elif CONFIG.get('use_lemmatization'):
        tokens = [lemmatizer.lemmatize(t) for t in tokens]
    
    return tokens

def expand_query(query):
    """Expand query with synonyms using WordNet"""
    if not CONFIG.get('enable_query_expansion'):
        return query
    
    expanded_terms = []
    tokens = word_tokenize(query.lower())
    
    for token in tokens:
        expanded_terms.append(token)
        # Get synonyms from WordNet
        synsets = wordnet.synsets(token)
        if synsets:
            # Add first 2 synonyms max
            for syn in synsets[:2]:
                for lemma in syn.lemmas()[:1]:
                    synonym = lemma.name().replace('_', ' ')
                    if synonym != token and synonym not in expanded_terms:
                        expanded_terms.append(synonym)
    
    return ' '.join(expanded_terms)

def extract_images_from_pdf(pdf_path, max_images=3):
    """Extract images from PDF file"""
    images = []
    try:
        import fitz  # PyMuPDF
        pdf_document = fitz.open(pdf_path)
        image_count = 0
        
        for page_num in range(min(10, len(pdf_document))):
            if image_count >= max_images:
                break
            
            page = pdf_document[page_num]
            image_list = page.get_images(full=True)
            
            for img_index, img_info in enumerate(image_list):
                if image_count >= max_images:
                    break
                
                try:
                    xref = img_info[0]
                    base_image = pdf_document.extract_image(xref)
                    image_bytes = base_image["image"]
                    
                    # Convert to PIL Image
                    img = Image.open(io.BytesIO(image_bytes))
                    
                    # Skip very small images
                    if img.width < 50 or img.height < 50:
                        continue
                    
                    # Resize if too large
                    if img.width > 600 or img.height > 600:
                        img.thumbnail((600, 600), Image.Resampling.LANCZOS)
                    
                    # Convert to RGB if necessary
                    if img.mode not in ('RGB', 'L'):
                        img = img.convert('RGB')
                    
                    # Convert to base64 (return just the base64 string without prefix)
                    buffered = io.BytesIO()
                    img.save(buffered, format="PNG")
                    img_str = base64.b64encode(buffered.getvalue()).decode()
                    
                    # Return as plain base64 string, not object
                    images.append(img_str)
                    image_count += 1
                except Exception:
                    continue
        
        pdf_document.close()
    except ImportError:
        # Fallback: PyMuPDF not installed, skip image extraction
        pass
    except Exception:
        pass
    
    return images

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file with error handling"""
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            # Limit to first 20 pages for performance
            max_pages = min(CONFIG.get('max_pages_per_pdf', 20), len(pdf_reader.pages))
            for i in range(max_pages):
                try:
                    page_text = pdf_reader.pages[i].extract_text()
                    if page_text:
                        text += page_text + "\n"
                except (KeyboardInterrupt, SystemExit):
                    raise
                except Exception:
                    # Skip problematic pages silently
                    continue
    except (KeyboardInterrupt, SystemExit):
        raise
    except Exception as e:
        # Skip entire PDF if unreadable
        return ""
    return text

def extract_text_from_txt(txt_path):
    """Extract text from text file"""
    try:
        with open(txt_path, 'r', encoding='utf-8', errors='ignore') as file:
            return file.read()
    except Exception as e:
        print(f"Error reading text file {txt_path}: {e}")
        return ""

def get_files_hash(docs_path):
    """Calculate hash of all files in docs folder to detect changes"""
    file_info = []
    for root, dirs, files in os.walk(docs_path):
        for filename in files:
            if filename.endswith('.pdf') or filename.endswith('.txt'):
                file_path = os.path.join(root, filename)
                # Get file modification time and size
                stat = os.stat(file_path)
                file_info.append(f"{file_path}:{stat.st_mtime}:{stat.st_size}")
    
    # Sort for consistent hashing
    file_info.sort()
    combined = '|'.join(file_info)
    return hashlib.md5(combined.encode()).hexdigest()

def load_from_cache():
    """Load documents from cache if available"""
    global documents, doc_names, doc_images, doc_metadata, processed_docs
    global tfidf_vectorizer, tfidf_matrix, bm25_model, semantic_embeddings
    
    try:
        if os.path.exists(CACHE_FILE):
            print("Loading documents from cache...")
            with open(CACHE_FILE, 'rb') as f:
                cache_data = pickle.load(f)
                documents = cache_data['documents']
                doc_names = cache_data['doc_names']
                doc_images = cache_data.get('doc_images', [[] for _ in documents])
                doc_metadata = cache_data.get('doc_metadata', [{} for _ in documents])
                processed_docs = cache_data.get('processed_docs', [])
                tfidf_vectorizer = cache_data['tfidf_vectorizer']
                tfidf_matrix = cache_data['tfidf_matrix']
                bm25_model = cache_data.get('bm25_model')
                semantic_embeddings = cache_data.get('semantic_embeddings')
            print(f"Loaded {len(documents)} documents from cache!")
            return True
    except Exception as e:
        print(f"Error loading cache: {e}")
    return False

def save_to_cache():
    """Save documents to cache"""
    try:
        print("Saving documents to cache...")
        cache_data = {
            'documents': documents,
            'doc_names': doc_names,
            'doc_images': doc_images,
            'doc_metadata': doc_metadata,
            'processed_docs': processed_docs,
            'tfidf_vectorizer': tfidf_vectorizer,
            'tfidf_matrix': tfidf_matrix,
            'bm25_model': bm25_model,
            'semantic_embeddings': semantic_embeddings
        }
        with open(CACHE_FILE, 'wb') as f:
            pickle.dump(cache_data, f)
        print("Cache saved successfully!")
    except Exception as e:
        print(f"Error saving cache: {e}")

def load_documents(force_reload=False):
    """Load all documents from the data/docs folder and subfolders"""
    global documents, doc_names, doc_images, tfidf_vectorizer, tfidf_matrix
    
    docs_path = os.path.join(BASE_DIR, 'data', 'docs')
    
    if not os.path.exists(docs_path):
        os.makedirs(docs_path)
        return
    
    # Calculate current files hash
    current_hash = get_files_hash(docs_path)
    
    # Check if we can use cache
    if not force_reload and os.path.exists(HASH_FILE):
        with open(HASH_FILE, 'r') as f:
            cached_hash = f.read().strip()
        
        if cached_hash == current_hash:
            print("No changes detected in documents folder.")
            if load_from_cache():
                return
            else:
                print("Cache load failed, reloading documents...")
    
    # Load documents from files
    documents = []
    doc_names = []
    doc_images = []
    
    print("Scanning for documents...")
    file_count = 0
    
    # Walk through all subdirectories
    for root, dirs, files in os.walk(docs_path):
        for filename in files:
            if not (filename.endswith('.pdf') or filename.endswith('.txt')):
                continue
                
            file_count += 1
            file_path = os.path.join(root, filename)
            
            # Get relative path for display
            rel_path = os.path.relpath(file_path, docs_path)
            
            print(f"[{file_count}] {rel_path[:60]}{'...' if len(rel_path) > 60 else ''}")
            
            try:
                if filename.endswith('.pdf'):
                    text = extract_text_from_pdf(file_path)
                    if not text or len(text.strip()) < 50:
                        # Skip PDFs with no extractable text
                        continue
                    images = extract_images_from_pdf(file_path)
                elif filename.endswith('.txt'):
                    text = extract_text_from_txt(file_path)
                    images = []
                else:
                    continue
                
                if text.strip():
                    documents.append(text)
                    doc_names.append(rel_path)
                    doc_images.append(images)
            except Exception as e:
                print(f"  ⚠ Error loading: {e}")
    
    print(f"\nSuccessfully loaded {len(documents)} documents!")
    
    if documents:
        print("Building search indices...")
        
        # Build TF-IDF index
        print("  - TF-IDF...")
        tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=CONFIG.get('tfidf_max_features', 1000))
        tfidf_matrix = tfidf_vectorizer.fit_transform(documents)
        
        # Build BM25 index
        print("  - BM25...")
        processed_docs = [preprocess_text_advanced(doc) for doc in documents]
        bm25_model = BM25Okapi(processed_docs)
        
        # Build semantic embeddings if available
        if SEMANTIC_AVAILABLE and SEMANTIC_MODEL is not None:
            print("  - Semantic embeddings...")
            try:
                semantic_embeddings = SEMANTIC_MODEL.encode(documents, show_progress_bar=False)
                print("  ✓ All indices built successfully!")
            except Exception as e:
                print(f"  ⚠ Semantic embeddings failed: {e}")
                semantic_embeddings = None
        else:
            print("  ⚠ Semantic search not available")
            semantic_embeddings = None
        
        # Save to cache
        save_to_cache()
        
        # Save current hash
        with open(HASH_FILE, 'w') as f:
            f.write(current_hash)
        print("Documents cached for faster startup next time!")

def preprocess_text(text):
    """Preprocess text for better matching"""
    # Remove special characters and extra spaces
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_summary_and_points(text, query, context_window=200):
    """Extract clean summary and key bullet points from text"""
    text_lower = text.lower()
    query_lower = query.lower()
    query_words = [w for w in query_lower.split() if len(w) > 2]
    
    # Find all occurrences of query words
    matches = []
    for word in query_words:
        pattern = r'\b' + re.escape(word) + r'\w*\b'
        for match in re.finditer(pattern, text_lower):
            matches.append((match.start(), match.end(), word))
    
    if not matches:
        # Return first part as summary
        summary = text[:context_window * 2]
        summary = re.sub(r'\s+', ' ', summary).strip()
        return {'summary': summary[:300] + '...', 'points': []}
    
    # Sort matches by position
    matches.sort()
    
    # Extract snippets around matches
    snippets = []
    seen_ranges = []
    
    for start, end, word in matches[:5]:  # Top 5 matches
        # Check if this range overlaps with existing
        overlaps = False
        for seen_start, seen_end in seen_ranges:
            if not (end < seen_start or start > seen_end):
                overlaps = True
                break
        if overlaps:
            continue
        
        # Get context window
        context_start = max(0, start - context_window)
        context_end = min(len(text), end + context_window)
        
        # Adjust to sentence boundaries
        while context_start > 0 and text[context_start] not in '.!?\n':
            context_start -= 1
        if context_start > 0:
            context_start += 1
        
        while context_end < len(text) and text[context_end] not in '.!?\n':
            context_end += 1
        
        snippet = text[context_start:context_end].strip()
        
        # Clean up snippet
        snippet = re.sub(r'\s+', ' ', snippet)
        snippet = re.sub(r'\s*([.,;:!?])\s*', r'\1 ', snippet)
        
        snippets.append(snippet)
        seen_ranges.append((context_start, context_end))
    
    # Create summary from first snippet
    summary = snippets[0][:300] + '...' if snippets else text[:300] + '...'
    summary = re.sub(r'\s+', ' ', summary).strip()
    
    # Extract bullet points from snippets
    points = []
    for snippet in snippets[:5]:
        # Look for bullet point patterns
        bullet_matches = re.findall(r'[•\u2022\u25cf\u25cb-]\s*([^•\u2022\u25cf\u25cb\n]{20,150})', snippet)
        if bullet_matches:
            for point in bullet_matches[:3]:
                clean_point = re.sub(r'\s+', ' ', point).strip()
                if len(clean_point) > 15 and clean_point not in points:
                    points.append(clean_point)
        # Or extract sentences with query words
        elif len(points) < 5:
            sentences = re.split(r'[.!?]\s+', snippet)
            for sent in sentences:
                if any(word in sent.lower() for word in query_words) and len(sent) > 20:
                    clean_sent = re.sub(r'\s+', ' ', sent).strip()
                    if clean_sent and clean_sent not in points and len(points) < 5:
                        points.append(clean_sent[:150])
    
    # Highlight query words in summary and points
    def highlight_words(text):
        for word in query_words:
            pattern = r'\b(' + re.escape(word) + r'\w*)\b'
            text = re.sub(pattern, r'<mark>\1</mark>', text, flags=re.IGNORECASE)
        return text
    
    summary = highlight_words(summary)
    points = [highlight_words(p) for p in points[:5]]
    
    return {'summary': summary, 'points': points}

def highlight_text(text, query, context_window=150):
    """Highlight matching text and extract context"""
    text_lower = text.lower()
    query_lower = query.lower()
    query_words = query_lower.split()
    
    # Find all occurrences of query words
    matches = []
    for word in query_words:
        if len(word) > 2:  # Skip very short words
            pattern = r'\b' + re.escape(word) + r'\w*\b'
            for match in re.finditer(pattern, text_lower):
                matches.append((match.start(), match.end()))
    
    if not matches:
        # Return first part of text if no matches
        preview = text[:context_window * 2] + ('...' if len(text) > context_window * 2 else '')
        return preview
    
    # Sort matches by position
    matches.sort()
    
    # Extract context around first few matches
    snippets = []
    seen_positions = set()
    
    for start, end in matches[:3]:  # Show up to 3 matches
        if start in seen_positions:
            continue
        
        # Get context window
        context_start = max(0, start - context_window)
        context_end = min(len(text), end + context_window)
        
        # Adjust to word boundaries
        while context_start > 0 and text[context_start] not in ' \n':
            context_start -= 1
        while context_end < len(text) and text[context_end] not in ' \n':
            context_end += 1
        
        snippet = text[context_start:context_end].strip()
        
        # Clean up and format the snippet
        # Preserve bullet points and list formatting
        snippet = re.sub(r'\s+', ' ', snippet)  # Normalize whitespace but keep structure
        snippet = re.sub(r'(\w)\s*•\s*', r'\1 • ', snippet)  # Normalize bullet spacing
        
        # Highlight matches in snippet
        for word in query_words:
            if len(word) > 2:
                pattern = r'\b(' + re.escape(word) + r'\w*)\b'
                snippet = re.sub(pattern, r'<mark>\1</mark>', snippet, flags=re.IGNORECASE)
        
        prefix = '...' if context_start > 0 else ''
        suffix = '...' if context_end < len(text) else ''
        snippets.append(prefix + snippet + suffix)
        
        seen_positions.add(start)
    
    return ' [...] '.join(snippets)


def summarize_snippet(snippet, max_sentences=2):
    """Create a short 2-line summary from a highlighted snippet."""
    if not snippet:
        return ''

    # Remove excessive whitespace and normalize
    s = re.sub(r"\s+", ' ', snippet)

    # Remove leading/trailing ellipses markers used by highlight_text
    s = s.replace('... ', '').replace(' ...', '')

    # Try to split into sentences (simple heuristic)
    parts = re.split(r'[\.\!\?]\s+', re.sub(r'<[^>]+>', '', s))
    summary_sentences = [p.strip() for p in parts if p.strip()]
    summary = ' '.join(summary_sentences[:max_sentences])

    # Ensure no weird spacing
    summary = re.sub(r"\s+", ' ', summary).strip()
    return summary


def extract_key_points(snippet, max_points=5):
    """Extract 3-5 concise key points from the snippet.
    Preserves any <mark> highlights produced by `highlight_text`.
    """
    if not snippet:
        return []

    # Normalize newlines and bullet markers
    s = snippet.replace('\r', '\n')
    s = s.replace('\u2022', '•')

    # Split by explicit bullet markers first
    parts = []
    if '•' in s:
        for p in s.split('•'):
            p = p.strip()
            if p:
                parts.append(p)
    else:
        # Fallback: split by sentence endings, keep short phrases
        raw = re.split(r'[\.\!\?]\s+', s)
        for r in raw:
            r = r.strip()
            if r:
                parts.append(r)

    # Clean parts: remove duplicates and very short fragments
    cleaned = []
    seen = set()
    for p in parts:
        # Trim and collapse spaces
        txt = re.sub(r'\s+', ' ', p).strip()
        # Skip if too short
        if len(re.sub(r'<[^>]+>', '', txt)) < 20:
            continue
        key = re.sub(r'<[^>]+>', '', txt).lower()
        if key in seen:
            continue
        seen.add(key)
        # Ensure we limit length
        if len(txt) > 200:
            txt = txt[:197].rstrip() + '...'
        # Keep mark tags intact
        cleaned.append(txt)
        if len(cleaned) >= max_points:
            break

    # If nothing extracted, return a short fallback
    if not cleaned:
        plain = re.sub(r'<[^>]+>', '', s)
        return [plain[:150].strip() + ('...' if len(plain) > 150 else '')]

    # Prepend bullet markers to match UI style
    return cleaned

def search_tfidf(query, top_k=5, filter_files=None):
    """Search using TF-IDF"""
    if not documents:
        return []
    
    query_vec = tfidf_vectorizer.transform([query])
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    
    # Apply file filtering if specified
    if filter_files:
        filtered_indices = []
        for i, doc_name in enumerate(doc_names):
            # Check if document matches any filter
            for filter_item in filter_files:
                # Match exact file or files in folder
                if doc_name == filter_item or doc_name.startswith(filter_item + '\\') or doc_name.startswith(filter_item + '/'):
                    filtered_indices.append(i)
                    break
        
        # Filter similarities to only include matching documents
        if filtered_indices:
            filtered_similarities = np.zeros_like(similarities)
            filtered_similarities[filtered_indices] = similarities[filtered_indices]
            similarities = filtered_similarities
    
    # Get top-k results
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    results = []
    for idx in top_indices:
        if similarities[idx] > 0:  # Only return if there's some similarity
            # Extract structured content
            content = extract_summary_and_points(documents[idx], query)
            
            # Get file metadata
            file_path = os.path.join(BASE_DIR, 'data', 'docs', doc_names[idx])
            file_type = 'PDF' if doc_names[idx].endswith('.pdf') else 'TXT'
            folder = os.path.dirname(doc_names[idx]) or 'Root'
            
            # Get file stats if available
            file_size = ''
            modified_date = ''
            if os.path.exists(file_path):
                try:
                    stat = os.stat(file_path)
                    file_size = f"{stat.st_size / 1024:.1f} KB"
                    modified_date = datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d')
                except:
                    pass
            
            results.append({
                'filename': doc_names[idx],
                'score': float(similarities[idx]),
                'summary': content['summary'],
                'key_points': content['points'],
                'images': doc_images[idx] if idx < len(doc_images) else [],
                'file_type': file_type,
                'folder': folder,
                'file_size': file_size,
                'modified_date': modified_date,
                'method': 'tfidf'
            })
    
    return results

def search_bm25(query, top_k=5, filter_files=None):
    """Search using BM25 algorithm"""
    global bm25_model, processed_docs
    
    if not documents:
        print("DEBUG: No documents loaded")
        return []
    
    # Build BM25 model if not exists
    if bm25_model is None or not processed_docs:
        print("DEBUG: Building BM25 model...")
        processed_docs = [preprocess_text_advanced(doc) for doc in documents]
        bm25_model = BM25Okapi(processed_docs)
        print(f"DEBUG: BM25 model built with {len(processed_docs)} docs")
    
    # Preprocess query
    query_tokens = preprocess_text_advanced(query)
    print(f"DEBUG: Query tokens: {query_tokens[:10]}")  # First 10 tokens
    
    # Get BM25 scores
    scores = bm25_model.get_scores(query_tokens)
    print(f"DEBUG: Score range: {scores.min():.4f} to {scores.max():.4f}")
    print(f"DEBUG: Top 5 scores: {sorted(scores, reverse=True)[:5]}")
    
    # Get BM25 scores
    scores = bm25_model.get_scores(query_tokens)
    
    # Apply filtering
    if filter_files:
        filtered_scores = np.zeros_like(scores)
        for i, doc_name in enumerate(doc_names):
            for filter_item in filter_files:
                if doc_name == filter_item or doc_name.startswith(filter_item + '\\') or doc_name.startswith(filter_item + '/'):
                    filtered_scores[i] = scores[i]
                    break
        scores = filtered_scores
    
    # Get top-k indices
    top_indices = np.argsort(scores)[::-1][:top_k]
    
    results = []
    max_score = scores[top_indices[0]] if len(top_indices) > 0 and scores[top_indices[0]] > 0 else 1.0
    
    for idx in top_indices:
        # Include results even with very low scores for BM25
        if scores[idx] >= 0:
            content = extract_summary_and_points(documents[idx], query)
            file_path = os.path.join(BASE_DIR, 'data', 'docs', doc_names[idx])
            file_type = 'PDF' if doc_names[idx].endswith('.pdf') else 'TXT'
            folder = os.path.dirname(doc_names[idx]) or 'Root'
            
            file_size = ''
            modified_date = ''
            if os.path.exists(file_path):
                try:
                    stat = os.stat(file_path)
                    file_size = f"{stat.st_size / 1024:.1f} KB"
                    modified_date = datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d')
                except:
                    pass
            
            # Normalize BM25 score relative to max
            normalized_score = float(scores[idx] / max_score) if max_score > 0 else 0.0
            
            results.append({
                'filename': doc_names[idx],
                'score': float(normalized_score),
                'summary': content['summary'],
                'key_points': content['points'],
                'images': doc_images[idx] if idx < len(doc_images) else [],
                'file_type': file_type,
                'folder': folder,
                'file_size': file_size,
                'modified_date': modified_date,
                'method': 'bm25'
            })
    
    return results

def search_semantic(query, top_k=5, filter_files=None):
    """Search using semantic similarity with sentence embeddings"""
    global semantic_embeddings, SEMANTIC_MODEL
    
    if not SEMANTIC_AVAILABLE or SEMANTIC_MODEL is None:
        return search_tfidf(query, top_k, filter_files)
    
    if not documents:
        return []
    
    # Build embeddings if not exists
    if semantic_embeddings is None:
        print("Building semantic embeddings...")
        semantic_embeddings = SEMANTIC_MODEL.encode(documents, show_progress_bar=False)
    
    # Encode query
    query_embedding = SEMANTIC_MODEL.encode([query])[0]
    
    # Calculate cosine similarities
    similarities = cosine_similarity([query_embedding], semantic_embeddings).flatten()
    
    # Apply filtering
    if filter_files:
        filtered_similarities = np.zeros_like(similarities)
        for i, doc_name in enumerate(doc_names):
            for filter_item in filter_files:
                if doc_name == filter_item or doc_name.startswith(filter_item + '\\') or doc_name.startswith(filter_item + '/'):
                    filtered_similarities[i] = similarities[i]
                    break
        similarities = filtered_similarities
    
    # Get top-k results
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    results = []
    for idx in top_indices:
        if similarities[idx] > 0:
            content = extract_summary_and_points(documents[idx], query)
            file_path = os.path.join(BASE_DIR, 'data', 'docs', doc_names[idx])
            file_type = 'PDF' if doc_names[idx].endswith('.pdf') else 'TXT'
            folder = os.path.dirname(doc_names[idx]) or 'Root'
            
            file_size = ''
            modified_date = ''
            if os.path.exists(file_path):
                try:
                    stat = os.stat(file_path)
                    file_size = f"{stat.st_size / 1024:.1f} KB"
                    modified_date = datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d')
                except:
                    pass
            
            results.append({
                'filename': doc_names[idx],
                'score': float(similarities[idx]),
                'summary': content['summary'],
                'key_points': content['points'],
                'images': doc_images[idx] if idx < len(doc_images) else [],
                'file_type': file_type,
                'folder': folder,
                'file_size': file_size,
                'modified_date': modified_date,
                'method': 'semantic'
            })
    
    return results

def search_hybrid(query, top_k=5, alpha=0.5, filter_files=None):
    """Advanced hybrid search combining TF-IDF, BM25, and Semantic"""
    if not documents:
        return []
    
    # Get results from all methods
    tfidf_results = search_tfidf(query, top_k=top_k*2, filter_files=filter_files)
    bm25_results = search_bm25(query, top_k=top_k*2, filter_files=filter_files)
    semantic_results = search_semantic(query, top_k=top_k*2, filter_files=filter_files)
    
    # Combine scores using weighted average
    combined_scores = {}
    
    # TF-IDF scores (30% weight)
    for result in tfidf_results:
        filename = result['filename']
        if filename not in combined_scores:
            combined_scores[filename] = {'score': 0, 'result': result, 'methods': {}}
        combined_scores[filename]['score'] += result['score'] * 0.3
        combined_scores[filename]['methods']['tfidf'] = result['score']
    
    # BM25 scores (35% weight)
    for result in bm25_results:
        filename = result['filename']
        if filename not in combined_scores:
            combined_scores[filename] = {'score': 0, 'result': result, 'methods': {}}
        combined_scores[filename]['score'] += result['score'] * 0.35
        combined_scores[filename]['methods']['bm25'] = result['score']
    
    # Semantic scores (35% weight)
    for result in semantic_results:
        filename = result['filename']
        if filename not in combined_scores:
            combined_scores[filename] = {'score': 0, 'result': result, 'methods': {}}
        combined_scores[filename]['score'] += result['score'] * 0.35
        combined_scores[filename]['methods']['semantic'] = result['score']
    
    # Sort by combined score
    sorted_results = sorted(combined_scores.items(), key=lambda x: x[1]['score'], reverse=True)
    
    # Format results with score breakdown
    final_results = []
    for filename, data in sorted_results[:top_k]:
        result = data['result'].copy()
        result['score'] = data['score']
        result['method'] = 'hybrid'
        result['tfidf_score'] = data['methods'].get('tfidf', 0)
        result['bm25_score'] = data['methods'].get('bm25', 0)
        result['semantic_score'] = data['methods'].get('semantic', 0)
        final_results.append(result)
    
    return final_results

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html', doc_count=len(documents))

@app.route('/get_files', methods=['GET'])
def get_files():
    """Get list of all files and folders"""
    try:
        # Get unique folders
        folders = set()
        files_list = []
        
        for doc_name in doc_names:
            # Add to files list
            files_list.append(doc_name)
            
            # Extract folder path
            if '\\' in doc_name or '/' in doc_name:
                folder = os.path.dirname(doc_name)
                if folder:
                    folders.add(folder)
        
        return jsonify({
            'folders': sorted(list(folders)),
            'files': sorted(files_list)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/search', methods=['POST'])
def search():
    """Handle search requests"""
    data = request.json
    query = data.get('query', '').strip()
    search_type = data.get('search_type', 'hybrid')
    filter_files = data.get('filter_files', [])
    
    if not query:
        return jsonify({'error': 'Please enter a search query'}), 400
    
    if not documents:
        return jsonify({'error': 'No documents found. Please add PDFs or text files to the data/docs folder'}), 404
    
    try:
        if search_type == 'tfidf':
            results = search_tfidf(query, filter_files=filter_files)
        elif search_type == 'bm25':
            results = search_bm25(query, filter_files=filter_files)
        elif search_type == 'semantic':
            results = search_semantic(query, filter_files=filter_files)
        else:  # hybrid
            results = search_hybrid(query, filter_files=filter_files)
        
        return jsonify({
            'query': query,
            'search_type': search_type,
            'filter_files': filter_files,
            'results': results,
            'total': len(results)
        })
    except Exception as e:
        return jsonify({'error': f'Search error: {str(e)}'}), 500

@app.route('/reload', methods=['POST'])
def reload():
    """Reload documents from the folder"""
    try:
        load_documents(force_reload=True)
        return jsonify({
            'message': 'Documents reloaded successfully',
            'doc_count': len(documents)
        })
    except Exception as e:
        return jsonify({'error': f'Error reloading documents: {str(e)}'}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        allowed_extensions = {'.pdf', '.txt', '.doc', '.docx'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            return jsonify({'error': f'File type {file_ext} not supported. Please upload PDF, TXT, DOC, or DOCX files'}), 400
        
        # Create uploads directory in data/docs
        upload_dir = os.path.join(BASE_DIR, 'data', 'docs', 'uploads')
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
        
        # Save file with unique name if already exists
        base_name = file.filename
        file_path = os.path.join(upload_dir, base_name)
        counter = 1
        
        while os.path.exists(file_path):
            name, ext = os.path.splitext(base_name)
            file_path = os.path.join(upload_dir, f"{name}_{counter}{ext}")
            counter += 1
        
        # Save the file
        file.save(file_path)
        
        # Process the uploaded file
        try:
            if file_ext == '.pdf':
                text = extract_text_from_pdf(file_path)
                if not text or len(text.strip()) < 50:
                    os.remove(file_path)
                    return jsonify({'error': 'Could not extract text from PDF. The file might be empty or image-based.'}), 400
                images = extract_images_from_pdf(file_path)
            elif file_ext == '.txt':
                text = extract_text_from_txt(file_path)
                images = []
            elif file_ext in ['.doc', '.docx']:
                # For DOC/DOCX, you would need python-docx library
                # For now, return error or convert to text
                return jsonify({'error': 'DOC/DOCX support coming soon. Please upload PDF or TXT files.'}), 400
            else:
                return jsonify({'error': 'Unsupported file type'}), 400
            
            if not text.strip():
                os.remove(file_path)
                return jsonify({'error': 'File appears to be empty'}), 400
            
            # Add to document collection
            rel_path = os.path.join('uploads', os.path.basename(file_path))
            documents.append(text)
            doc_names.append(rel_path)
            doc_images.append(images)
            
            # Rebuild indices
            print(f"Rebuilding indices with {len(documents)} documents...")
            
            # Rebuild TF-IDF
            global tfidf_vectorizer, tfidf_matrix, bm25_model, processed_docs, semantic_embeddings
            tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=CONFIG.get('tfidf_max_features', 1000))
            tfidf_matrix = tfidf_vectorizer.fit_transform(documents)
            
            # Rebuild BM25
            processed_docs = [preprocess_text_advanced(doc) for doc in documents]
            bm25_model = BM25Okapi(processed_docs)
            
            # Rebuild semantic embeddings if available
            if SEMANTIC_AVAILABLE and SEMANTIC_MODEL is not None:
                try:
                    semantic_embeddings = SEMANTIC_MODEL.encode(documents, show_progress_bar=False)
                except Exception as e:
                    print(f"Error building semantic embeddings: {e}")
                    semantic_embeddings = None
            
            # Update cache
            save_to_cache()
            
            # Update hash file
            docs_path = os.path.join(BASE_DIR, 'data', 'docs')
            current_hash = get_files_hash(docs_path)
            with open(HASH_FILE, 'w') as f:
                f.write(current_hash)
            
            return jsonify({
                'message': 'File uploaded and indexed successfully',
                'filename': os.path.basename(file_path),
                'total_documents': len(documents)
            }), 200
            
        except Exception as e:
            # If processing fails, remove the file
            if os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({'error': f'Error processing file: {str(e)}'}), 500
        
    except Exception as e:
        return jsonify({'error': f'Upload error: {str(e)}'}), 500

@app.route('/download/<path:filename>', methods=['GET'])
def download_file(filename):
    """Download or view a file"""
    try:
        # Construct the full file path
        file_path = os.path.join(BASE_DIR, 'data', 'docs', filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404
        
        # Security check: ensure the file is within the docs directory
        docs_path = os.path.join(BASE_DIR, 'data', 'docs')
        if not os.path.abspath(file_path).startswith(os.path.abspath(docs_path)):
            return jsonify({'error': 'Access denied'}), 403
        
        # Send the file
        return send_file(file_path, as_attachment=False)
    except Exception as e:
        return jsonify({'error': f'Error downloading file: {str(e)}'}), 500

@app.route('/ai-chat', methods=['POST'])
def ai_chat():
    """AI-powered chat using search results"""
    try:
        data = request.json
        query = data.get('query', '').strip()
        search_results = data.get('search_results', [])
        conversation_history = data.get('conversation_history', [])
        
        if not query:
            return jsonify({'error': 'Please enter a query'}), 400
        
        # Extract relevant content from search results
        context_parts = []
        sources = []
        
        for i, result in enumerate(search_results[:5]):  # Top 5 results
            context_parts.append(f"Document {i+1}: {result['filename']}")
            context_parts.append(f"Content: {result.get('summary', '')}")
            if result.get('key_points'):
                context_parts.append("Key Points:")
                for point in result['key_points'][:3]:
                    # Remove HTML tags from points
                    clean_point = re.sub(r'<[^>]+>', '', point)
                    context_parts.append(f"- {clean_point}")
            context_parts.append("")  # Empty line between documents
            sources.append(result['filename'])
        
        context = "\n".join(context_parts)
        
        # Build conversation context
        conversation_context = ""
        if conversation_history:
            for msg in conversation_history[-3:]:  # Last 3 messages
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                conversation_context += f"{role.upper()}: {content}\n"
        
        # Create a comprehensive prompt
        prompt = f"""You are an AI assistant helping users understand information from their document collection.

Previous conversation:
{conversation_context if conversation_context else "No previous conversation"}

Current question: {query}

Relevant information from documents:
{context}

Based on the above information, provide a comprehensive, well-structured answer to the user's question. 

Instructions:
1. Start with a clear, direct answer to the question
2. Include detailed information from ALL provided documents, not just the first one
3. Organize the response with proper markdown formatting:
   - Use ### for main headings with relevant emojis (📚, 📖, ✨, 🔗, 🎯)
   - Use **bold** for emphasis
   - Use bullet points (•) or numbered lists for clarity
   - Add a summary section at the end
4. Reference specific documents when citing information
5. Synthesize information from multiple sources to provide a complete picture
6. If information spans multiple documents, connect the concepts logically

Keep your response clear, informative, engaging, and visually appealing with emojis and proper formatting."""

        # Try to use OpenAI API if available, otherwise provide a structured response
        try:
            from openai import OpenAI
            # Check if API key is set in environment
            api_key = os.getenv('OPENAI_API_KEY')
            if api_key and not api_key.startswith('sk-proj-YOUR'):
                client = OpenAI(api_key=api_key)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful AI assistant that answers questions based on provided document context. Format your responses using markdown with emojis for better readability."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1000
                )
                ai_response = response.choices[0].message.content
            else:
                raise Exception("OpenAI API key not set or invalid")
        except Exception as e:
            print(f"OpenAI API error: {e}")
            # Fallback: Generate a structured response from the context
            ai_response = generate_fallback_response(query, search_results, context)
        
        return jsonify({
            'response': ai_response,
            'sources': sources[:5],
            'context_used': len(search_results)
        })
        
    except Exception as e:
        return jsonify({'error': f'AI chat error: {str(e)}'}), 500

def generate_fallback_response(query, search_results, context):
    """Generate a structured response when AI API is not available"""
    if not search_results:
        return f"""🔍 I searched through the document collection for information about **"{query}"**, but couldn't find any relevant documents.

### 💡 Suggestions:
• Try rephrasing your question
• Use different keywords  
• Check if documents related to this topic have been uploaded

Would you like to try a different question? 🤔"""
    
    # Extract key information
    top_result = search_results[0]
    response_parts = []
    
    response_parts.append(f"### 📚 Based on your question about **'{query}'**\n")
    
    # Add comprehensive answer synthesized from top result
    if top_result.get('summary'):
        clean_summary = re.sub(r'<[^>]+>', '', top_result['summary'])
        response_parts.append(f"### 📖 Main Information:")
        response_parts.append(clean_summary)
        response_parts.append("")
    
    # Add key points from primary document
    if top_result.get('key_points'):
        response_parts.append("### ✨ Key Points:")
        for i, point in enumerate(top_result['key_points'][:5], 1):
            clean_point = re.sub(r'<[^>]+>', '', point)
            response_parts.append(f"**{i}.** {clean_point}")
        response_parts.append("")
    
    # Add detailed information from other relevant sources (increased from 2 to 4 documents)
    if len(search_results) > 1:
        response_parts.append("### 🔗 Additional Context from Other Documents:\n")
        for idx, result in enumerate(search_results[1:5], 1):  # Show up to 4 additional documents
            response_parts.append(f"#### 📄 **{result['filename']}**")
            
            # Add full summary for better context
            if result.get('summary'):
                clean_summary = re.sub(r'<[^>]+>', '', result['summary'])
                response_parts.append(f"{clean_summary}")
                response_parts.append("")
            
            # Add key points from this document too
            if result.get('key_points') and len(result['key_points']) > 0:
                response_parts.append("**Key insights:**")
                for point in result['key_points'][:3]:  # Top 3 points per document
                    clean_point = re.sub(r'<[^>]+>', '', point)
                    response_parts.append(f"• {clean_point}")
                response_parts.append("")
    
    # Add a comprehensive summary section
    response_parts.append("---\n")
    response_parts.append("### 🎯 Summary:")
    response_parts.append(f"This information is drawn from **{len(search_results)} relevant document(s)** in your collection. ")
    response_parts.append(f"The primary source is *{top_result['filename']}*")
    if len(search_results) > 1:
        response_parts.append(f", with supporting information from {len(search_results) - 1} additional document(s).")
    else:
        response_parts.append(".")
    response_parts.append("")
    
    response_parts.append("💬 *Feel free to ask follow-up questions or request more details about any specific aspect!*")
    
    return "\n".join(response_parts)

@app.route('/hero')
def hero():
    """Hero landing page with animated background paths"""
    return render_template('hero.html')

if __name__ == '__main__':
    print("Loading documents...")
    load_documents()
    print(f"Loaded {len(documents)} documents")
    print("Starting Flask server...")
    # Disable reloader to avoid MemoryError with PyPDF2 on Windows
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
