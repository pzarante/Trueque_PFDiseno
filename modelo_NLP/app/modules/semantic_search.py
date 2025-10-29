from flask import Blueprint, request, jsonify, current_app
from app.services.nlp_processor import clean_text, text_to_embeddings
from app.chroma_BD.chroma import get_chroma_collection

semantic_search = Blueprint('semantic_search', __name__)

@semantic_search.route('/search', methods=['GET'])
def search_offers():
    query_text = request.args.get("query", "").strip()
    n = int(request.args.get("n", 5))
    category = request.args.get("category", "").lower()

    if not query_text:
        return jsonify({"error": "Parámetro 'query' es obligatorio"}), 400
    
    clear_query = clean_text(query_text)

    query_embedding = text_to_embeddings(clear_query)

    # Para filtros combinados
    where_filter = {"category": category} if category else {}

    results = current_app.collection.query(
        query_embeddings=query_embedding,
        n_results=n
    )
    
    return jsonify({"results":results})