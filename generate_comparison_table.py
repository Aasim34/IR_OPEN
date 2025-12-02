"""
Generate comparison table for IR report
"""

def generate_markdown_table(all_results):
    """
    Generate a markdown table comparing all search methods
    
    Args:
        all_results: List of dicts from evaluate_search_results()
    
    Returns:
        Markdown formatted table string
    """
    
    table = "## Search Method Comparison\\n\\n"
    table += "| Method | P@3 | P@5 | P@10 | R@10 | MAP | nDCG@10 |\\n"
    table += "|--------|-----|-----|------|------|-----|---------|\\n"
    
    for result in all_results:
        table += f"| {result['method']:12} | {result['P@3']:.3f} | {result['P@5']:.3f} | {result['P@10']:.3f} | {result['R@10']:.3f} | {result['MAP']:.3f} | {result['nDCG@10']:.3f} |\\n"
    
    table += "\\n**Legend:**\\n"
    table += "- **P@K**: Precision at K (higher is better)\\n"
    table += "- **R@10**: Recall at 10 (higher is better)\\n"
    table += "- **MAP**: Mean Average Precision (higher is better)\\n"
    table += "- **nDCG@10**: Normalized Discounted Cumulative Gain at 10 (higher is better)\\n"
    
    return table

def generate_latex_table(all_results):
    """Generate LaTeX table for academic reports"""
    
    table = "\\\\begin{table}[h]\\n"
    table += "\\\\centering\\n"
    table += "\\\\caption{Comparison of Information Retrieval Methods}\\n"
    table += "\\\\label{tab:ir-comparison}\\n"
    table += "\\\\begin{tabular}{|l|c|c|c|c|c|c|}\\n"
    table += "\\\\hline\\n"
    table += "\\\\textbf{Method} & \\\\textbf{P@3} & \\\\textbf{P@5} & \\\\textbf{P@10} & \\\\textbf{R@10} & \\\\textbf{MAP} & \\\\textbf{nDCG@10} \\\\\\\\\\n"
    table += "\\\\hline\\n"
    
    for result in all_results:
        table += f"{result['method']} & {result['P@3']:.3f} & {result['P@5']:.3f} & {result['P@10']:.3f} & {result['R@10']:.3f} & {result['MAP']:.3f} & {result['nDCG@10']:.3f} \\\\\\\\\\n"
    
    table += "\\\\hline\\n"
    table += "\\\\end{tabular}\\n"
    table += "\\\\end{table}\\n"
    
    return table

# Example usage
if __name__ == "__main__":
    # Example results (replace with actual evaluation results)
    example_results = [
        {
            'method': 'TF-IDF',
            'P@3': 0.667,
            'P@5': 0.600,
            'P@10': 0.450,
            'R@10': 0.750,
            'MAP': 0.712,
            'nDCG@10': 0.823
        },
        {
            'method': 'BM25',
            'P@3': 0.778,
            'P@5': 0.700,
            'P@10': 0.550,
            'R@10': 0.833,
            'MAP': 0.801,
            'nDCG@10': 0.891
        },
        {
            'method': 'Semantic',
            'P@3': 0.889,
            'P@5': 0.800,
            'P@10': 0.600,
            'R@10': 0.917,
            'MAP': 0.856,
            'nDCG@10': 0.923
        },
        {
            'method': 'Hybrid',
            'P@3': 0.889,
            'P@5': 0.867,
            'P@10': 0.650,
            'R@10': 0.950,
            'MAP': 0.892,
            'nDCG@10': 0.945
        }
    ]
    
    print("="*70)
    print("MARKDOWN TABLE (for GitHub/Markdown reports)")
    print("="*70)
    print(generate_markdown_table(example_results))
    
    print("\\n" + "="*70)
    print("LaTeX TABLE (for academic reports)")
    print("="*70)
    print(generate_latex_table(example_results))
    
    print("\\n" + "="*70)
    print("KEY INSIGHTS FROM EXAMPLE DATA:")
    print("="*70)
    print("✓ Hybrid search shows best overall performance")
    print("✓ BM25 outperforms TF-IDF consistently")
    print("✓ Semantic search excels in precision")
    print("✓ Combining methods (Hybrid) yields superior results")
