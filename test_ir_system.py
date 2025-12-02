"""
Quick Test Script for IR System
Run this to verify all features are working
"""

import sys
import os

# Add parent directory to path to import app
sys.path.insert(0, os.path.dirname(__file__))

def test_basic_functionality():
    """Test that app.py loads and basic functions work"""
    print("Testing basic imports...")
    try:
        import app
        print("✓ App module imported successfully")
    except Exception as e:
        print(f"✗ Failed to import app: {e}")
        return False
    
    print("\\nTesting configuration...")
    try:
        assert 'max_pages_per_pdf' in app.CONFIG
        assert 'hybrid_alpha' in app.CONFIG
        print(f"✓ Configuration loaded: {len(app.CONFIG)} parameters")
    except Exception as e:
        print(f"✗ Configuration error: {e}")
        return False
    
    print("\\nTesting NLP tools...")
    try:
        app.preprocess_text_advanced("testing stemming and lemmatization")
        print("✓ Text preprocessing works")
    except Exception as e:
        print(f"✗ Preprocessing error: {e}")
        return False
    
    try:
        expanded = app.expand_query("search engine")
        print(f"✓ Query expansion works: {expanded[:100]}...")
    except Exception as e:
        print(f"✗ Query expansion error: {e}")
        return False
    
    print("\\nTesting document loading...")
    try:
        app.load_documents(force_reload=False)
        print(f"✓ Documents loaded: {len(app.documents)} documents")
        print(f"  - Document names: {len(app.doc_names)}")
        # Handle both list and dict format for doc_images
        if isinstance(app.doc_images, dict):
            total_images = sum(len(imgs) for imgs in app.doc_images.values())
        else:
            total_images = sum(len(imgs) for imgs in app.doc_images)
        print(f"  - Images extracted: {total_images}")
    except Exception as e:
        print(f"✗ Document loading error: {e}")
        return False
    
    return True

def test_search_methods():
    """Test all search methods"""
    import app
    
    test_query = "machine learning"
    
    print("\\nTesting TF-IDF search...")
    try:
        results = app.search_tfidf(test_query)
        print(f"✓ TF-IDF returned {len(results)} results")
        if results:
            print(f"  Top result: {results[0]['filename']} (score: {results[0]['score']:.3f})")
    except Exception as e:
        print(f"✗ TF-IDF search error: {e}")
    
    print("\\nTesting BM25 search...")
    try:
        if hasattr(app, 'search_bm25'):
            results = app.search_bm25(test_query)
            print(f"✓ BM25 returned {len(results)} results")
            if results:
                print(f"  Top result: {results[0]['filename']} (score: {results[0]['score']:.3f})")
        else:
            print("⚠ BM25 search not implemented yet")
    except Exception as e:
        print(f"✗ BM25 search error: {e}")
    
    print("\\nTesting Semantic search...")
    try:
        results = app.search_semantic(test_query)
        print(f"✓ Semantic returned {len(results)} results")
        if results:
            print(f"  Top result: {results[0]['filename']} (score: {results[0].get('score', 'N/A')})")
    except Exception as e:
        print(f"✗ Semantic search error: {e}")
    
    print("\\nTesting Hybrid search...")
    try:
        results = app.search_hybrid(test_query)
        print(f"✓ Hybrid returned {len(results)} results")
        if results:
            print(f"  Top result: {results[0]['filename']}")
    except Exception as e:
        print(f"✗ Hybrid search error: {e}")

def test_caching():
    """Test caching system"""
    import app
    import time
    
    print("\\nTesting caching performance...")
    
    # First load
    app.load_documents(force_reload=True)
    start = time.time()
    app.load_documents(force_reload=False)
    cached_time = time.time() - start
    
    print(f"✓ Cached load time: {cached_time:.3f} seconds")
    
    if cached_time < 5:
        print(f"  ✓ Caching is working efficiently!")
    else:
        print(f"  ⚠ Caching may be slow")

def test_file_filtering():
    """Test file filtering functionality"""
    import app
    
    print("\\nTesting file filtering...")
    try:
        # Search with no filter
        all_results = app.search_tfidf("database")
        
        # Search with filter (assuming DBMS folder exists)
        filtered_results = app.search_tfidf("database", filter_files=["DBMS"])
        
        print(f"✓ All results: {len(all_results)}")
        print(f"✓ Filtered results: {len(filtered_results)}")
        
        if len(filtered_results) <= len(all_results):
            print("  ✓ Filtering works correctly")
        else:
            print("  ⚠ Filtering may have issues")
            
    except Exception as e:
        print(f"✗ Filtering error: {e}")

def run_all_tests():
    """Run complete test suite"""
    print("="*70)
    print("IR SYSTEM TEST SUITE")
    print("="*70)
    
    if not test_basic_functionality():
        print("\\n✗ Basic functionality tests failed. Fix issues before continuing.")
        return
    
    test_search_methods()
    test_caching()
    test_file_filtering()
    
    print("\\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print("Check above for any ✗ marks indicating failures")
    print("⚠ marks indicate warnings or incomplete features")
    print("✓ marks indicate successful tests")
    print("="*70)

if __name__ == "__main__":
    run_all_tests()
