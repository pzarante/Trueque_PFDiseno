from flask import Blueprint, request, jsonify, current_app
from app.services.nlp_processor import clean_text, text_to_embeddings
from app.chroma_BD.chroma import get_chroma_collection

semantic_search = Blueprint('semantic_search', __name__)

@semantic_search.route('/search', methods=['GET'])
def search_offers():
    query_text = request.args.get("query", "").strip()
    n = int(request.args.get("n", 10))
    category = request.args.get("category", "").lower()

    if not query_text:
        return jsonify({"error": "Parámetro 'query' es obligatorio"}), 400
    
    clear_query = clean_text(query_text)
    query_embedding = text_to_embeddings(clear_query)

    # Para filtros combinados
    where_filter = {"category": {"$eq": category}} if category else None

    if category:
        results = current_app.collection.query(
            query_embeddings=[query_embedding],
            n_results=n*2,
            where=where_filter
        )
    else:
        results = current_app.collection.query(
<<<<<<< HEAD
            query_embeddings=[query_embedding],
            n_results=n
=======
            query_embeddings=query_embedding,
            n_results=n*2
>>>>>>> modelo_NLP_bemontoya
        )

    # PROCESAR: combinar por offer_id
    offer_scores = {}
    for i, meta in enumerate(results["metadatas"][0]):
        offer_id = meta["offer_id"]
        tipo = meta.get("type", "")
        distance = results["distances"][0][i]
        score = max(0.0, 1.0 - distance / 2.0)  # similitud coseno aproximada

        if offer_id not in offer_scores or score > offer_scores[offer_id]["score"]:
            offer_scores[offer_id] = {
                "offer_id": offer_id,
                "type": tipo,
                "category": meta.get("category", ""),
                "score": score
            }
    
    # Convertir a lista y tomar top N final
    final_results = sorted(
        offer_scores.values(),
        key=lambda x: x["score"],
        reverse=True
    )[:n]

    return jsonify({
        "query": query_text,
        "results": final_results
    }), 200