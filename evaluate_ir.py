"""
IR System Evaluation Script
Run this to generate metrics for your report
"""

import json
import numpy as np
from collections import defaultdict

# Test queries with manually judged relevance
TEST_QUERIES = {
    "supervised learning": {
        "relevant_docs": [
            "machine_learning_notes.txt",
            "AIML\\AIML_UNIT1_COMPLETE.pdf",
            "AIML\\UNIT 3 PDF NOTES .pdf"
        ]
    },
    "database normalization": {
        "relevant_docs": [
            "DBMS\\DBMS_Full_Notes2018.pdf",
            "DBMS\\DBMS_Notes_Ch1_2_3.pdf",
            "DBMS\\UNIT-1-chapter-1.pdf"
        ]
    },
    "information retrieval models": {
        "relevant_docs": [
            "information_retrieval_basics.txt",
            "IR\\Unit 1\\IR unit 1 part 1.pdf",
            "IR\\Unit 1\\Search Engines.pdf"
        ]
    }
}

def calculate_precision_at_k(retrieved_docs, relevant_docs, k):
    """Calculate Precision@K"""
    top_k = retrieved_docs[:k]
    relevant_in_top_k = len([d for d in top_k if d in relevant_docs])
    return relevant_in_top_k / k if k > 0 else 0

def calculate_recall_at_k(retrieved_docs, relevant_docs, k):
    """Calculate Recall@K"""
    top_k = retrieved_docs[:k]
    relevant_in_top_k = len([d for d in top_k if d in relevant_docs])
    total_relevant = len(relevant_docs)
    return relevant_in_top_k / total_relevant if total_relevant > 0 else 0

def calculate_average_precision(retrieved_docs, relevant_docs):
    """Calculate Average Precision"""
    precisions = []
    num_relevant = 0
    
    for i, doc in enumerate(retrieved_docs):
        if doc in relevant_docs:
            num_relevant += 1
            precision_at_i = num_relevant / (i + 1)
            precisions.append(precision_at_i)
    
    return sum(precisions) / len(relevant_docs) if relevant_docs else 0

def calculate_dcg(relevance_scores, k):
    """Calculate Discounted Cumulative Gain@K"""
    dcg = 0
    for i, rel in enumerate(relevance_scores[:k]):
        dcg += rel / np.log2(i + 2)  # i+2 because i starts from 0
    return dcg

def calculate_ndcg(retrieved_docs, relevant_docs, k):
    """Calculate Normalized Discounted Cumulative Gain@K"""
    # Binary relevance: 1 if relevant, 0 if not
    relevance = [1 if doc in relevant_docs else 0 for doc in retrieved_docs[:k]]
    
    # Calculate DCG
    dcg = calculate_dcg(relevance, k)
    
    # Calculate IDCG (ideal)
    ideal_relevance = sorted([1] * min(len(relevant_docs), k) + [0] * k, reverse=True)
    idcg = calculate_dcg(ideal_relevance, k)
    
    return dcg / idcg if idcg > 0 else 0

# Example usage function
def evaluate_search_results(search_method_name, test_results):
    """
    Evaluate search results for all test queries
    
    Args:
        search_method_name: Name of search method (TF-IDF, BM25, Semantic, Hybrid)
        test_results: Dict mapping query -> list of retrieved doc names
    
    Returns:
        Dict with all metrics
    """
    metrics = {
        'method': search_method_name,
        'precision_at_3': [],
        'precision_at_5': [],
        'precision_at_10': [],
        'recall_at_10': [],
        'avg_precision': [],
        'ndcg_at_10': []
    }
    
    for query, ground_truth in TEST_QUERIES.items():
        if query not in test_results:
            continue
            
        retrieved = test_results[query]
        relevant = ground_truth['relevant_docs']
        
        metrics['precision_at_3'].append(calculate_precision_at_k(retrieved, relevant, 3))
        metrics['precision_at_5'].append(calculate_precision_at_k(retrieved, relevant, 5))
        metrics['precision_at_10'].append(calculate_precision_at_k(retrieved, relevant, 10))
        metrics['recall_at_10'].append(calculate_recall_at_k(retrieved, relevant, 10))
        metrics['avg_precision'].append(calculate_average_precision(retrieved, relevant))
        metrics['ndcg_at_10'].append(calculate_ndcg(retrieved, relevant, 10))
    
    # Calculate averages
    results = {
        'method': search_method_name,
        'P@3': round(sum(metrics['precision_at_3']) / len(metrics['precision_at_3']), 3),
        'P@5': round(sum(metrics['precision_at_5']) / len(metrics['precision_at_5']), 3),
        'P@10': round(sum(metrics['precision_at_10']) / len(metrics['precision_at_10']), 3),
        'R@10': round(sum(metrics['recall_at_10']) / len(metrics['recall_at_10']), 3),
        'MAP': round(sum(metrics['avg_precision']) / len(metrics['avg_precision']), 3),
        'nDCG@10': round(sum(metrics['ndcg_at_10']) / len(metrics['ndcg_at_10']), 3)
    }
    
    return results

# Example: How to use this
if __name__ == "__main__":
    print("="*60)
    print("IR System Evaluation Template")
    print("="*60)
    
    print("\\nTo use this script:")
    print("1. Run searches for each test query")
    print("2. Collect results in this format:")
    print()
    print("test_results_tfidf = {")
    for query in TEST_QUERIES:
        print(f'    "{query}": ["doc1.pdf", "doc2.txt", ...],')
    print("}")
    print()
    print("3. Call: evaluate_search_results('TF-IDF', test_results_tfidf)")
    print()
    
    # Example dummy results
    dummy_results = {}
    for query in TEST_QUERIES:
        dummy_results[query] = TEST_QUERIES[query]['relevant_docs'][:2] + ["random_doc.pdf"]
    
    print("\\nExample evaluation with dummy data:")
    print("-" * 60)
    
    results = evaluate_search_results("Example Method", dummy_results)
    
    print(f"Method: {results['method']}")
    print(f"Precision@3:  {results['P@3']}")
    print(f"Precision@5:  {results['P@5']}")
    print(f"Precision@10: {results['P@10']}")
    print(f"Recall@10:    {results['R@10']}")
    print(f"MAP:          {results['MAP']}")
    print(f"nDCG@10:      {results['nDCG@10']}")
    print()
    print("Compare multiple methods and create table for report!")
    print("="*60)
