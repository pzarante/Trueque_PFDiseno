from flask import Blueprint, request, jsonify
import requests
from app.services.metrics import compute_mrr, compute_ndcg

evaluate_bp = Blueprint("evaluate_bp", __name__)

@evaluate_bp.route("/nlp/evaluate", methods=["POST"])
def evaluate_model():
    data = request.get_json()

    if not isinstance(data, list) or len(data) == 0:
        return jsonify({"error": "Debe enviar una lista EVAL_DATA"}), 400

    BASE_URL = "http://localhost:5000/search?query="

    mrr_total = 0
    ndcg_total = 0
    results_output = []
    count = len(data)

    for item in data:
        query = item.get("query")
        relevant = item.get("relevant", [])

        if not query or not isinstance(relevant, list):
            return jsonify({"error": f"Formato inválido en item: {item}"}), 400

        try:
            response = requests.get(BASE_URL + query)
            response_data = response.json()

            result_ids = [r["offer_id"] for r in response_data["results"]]

            mrr = compute_mrr(result_ids, relevant)
            ndcg = compute_ndcg(result_ids, relevant)

            mrr_total += mrr
            ndcg_total += ndcg

            results_output.append({
                "query": query,
                "relevant": relevant,
                "result_ids": result_ids,
                "mrr": mrr,
                "ndcg": ndcg
            })

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # Métricas finales
    summary = {
        "mrr_avg": mrr_total / count,
        "ndcg_avg": ndcg_total / count,
        "total_queries": count
    }

    return jsonify({
        "summary": summary,
        "details": results_output
    }), 200
