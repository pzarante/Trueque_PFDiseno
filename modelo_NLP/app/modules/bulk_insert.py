from flask import Blueprint, request, jsonify, current_app
from app.services.nlp_processor import extract_keywords, clean_text, analyze_sentiment, text_to_embeddings
from app.postgres_DB.postgres import insert_history, upsert_offer_analysis

bulk_insert = Blueprint('bulk_insert', __name__)

@bulk_insert.route('/nlp/bulk_insert', methods=['POST'])
def bulk_insert_offers():
    data = request.get_json()

    if not isinstance(data, list) or len(data) == 0:
        return jsonify({"error": "Se requiere una lista de ofertas"}), 400

    inserted = 0
    errors = []
    processed_ids = []

    for offer in data:

        offer_id = offer.get("offer_id")
        title = offer.get("title", "")
        comment = offer.get("comment", "")
        category = offer.get("category", "").lower()
        user_id = offer.get("user_id")

        # Validación mínima
        if not offer_id or not user_id:
            errors.append({
                "item": offer,
                "error": "offer_id y user_id son obligatorios"
            })
            continue

        try:
            # Procesamiento de texto
            clean_title = clean_text(title)
            clean_comment = clean_text(comment)
            keywords = extract_keywords(title)
            sentiment = analyze_sentiment(clean_comment)

            # Generación de embeddings
            emb_title = text_to_embeddings(clean_title)
            emb_comment = text_to_embeddings(clean_comment)

            chroma_ids = [f"{offer_id}_title", f"{offer_id}_comment"]

            # Insertar en ChromaDB
            current_app.collection.add(
                ids=chroma_ids,
                embeddings=[emb_title, emb_comment],  
                metadatas=[
                    {"offer_id": offer_id, "type": "title", "category": category},
                    {"offer_id": offer_id, "type": "comment", "category": category},
                ]
            )

            # Guardar análisis NLP en PostgreSQL
            upsert_offer_analysis(offer_id, keywords, sentiment, False, False)

            # Agregar historial — tipo publicación
            insert_history(offer_id, user_id, "pub")

            inserted += 1
            processed_ids.append(offer_id)

        except Exception as e:
            errors.append({
                "item": offer,
                "error": str(e)
            })
            continue

    # Construir respuesta
    response = {
        "processed": len(data),
        "inserted": inserted,
        "failed": len(errors),
        "processed_ids": processed_ids,
        "errors": errors,
        "status": "partial" if errors else "success"
    }

    # Código 207: si hubo errores parciales
    return jsonify(response), (207 if errors else 200)
