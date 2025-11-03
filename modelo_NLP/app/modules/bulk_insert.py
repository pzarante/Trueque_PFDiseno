from flask import Blueprint, request, jsonify, current_app
from app.services.nlp_processor import extract_keywords, clean_text, analyze_sentiment, text_to_embeddings
from app.postgres_DB.postgres import insert_history, upsert_offer_analysis

bulk_insert = Blueprint('bulk_insert', __name__)

@bulk_insert.route('/nlp/bulk_insert', methods=['POST'])
def bulk_insert_offers():
    data = request.get_json()

    if not isinstance(data, list) or len(data) == 0:
        return jsonify({"error": "Se requiere una lista de ofertas"}), 400
    
    for offer in data:   
        offer_id = offer.get("offer_id")
        title = offer.get("title", "")
        comment = offer.get("comment", "")
        category = offer.get("category", "").lower()
        user_id = offer.get("user_id")

        # 1️⃣ Procesamiento de texto
        clean_title = clean_text(title)
        clean_comment = clean_text(comment)
        keywords = extract_keywords(title)
        sentiment = analyze_sentiment(clean_comment)

        # 2️⃣ Generación de embeddings
        emb_title = text_to_embeddings(clean_title)
        emb_comment = text_to_embeddings(clean_comment)
        chroma_ids = [f"{offer_id}_title", f"{offer_id}_comment"]

        current_app.collection.add(
        ids=chroma_ids,
        embeddings=[emb_title, emb_comment],  
        metadatas=[
            {"offer_id": offer_id, "type": "title", "category": category},
            {"offer_id": offer_id, "type": "comment", "category": category},
        ]
        )

        # --- Guardar análisis NLP en Supabase/PostgreSQL ---
        upsert_offer_analysis(offer_id, keywords, sentiment,False,False)
        insert_history(offer_id, user_id, "pub")

    return jsonify({"message": "Documents added successfully"}), 200
