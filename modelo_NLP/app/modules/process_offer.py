from flask import Blueprint, request, jsonify, current_app
from app.services.nlp_processor import extract_keywords, clean_text, analyze_sentiment, text_to_embeddings
from app.postgres_DB.postgres import upsert_offer_analysis, insert_history, get_offer_analysis

process_offer = Blueprint('process_offer', __name__)

@process_offer.route('/nlp/upsert_offer', methods=['POST'])  
def upsert_offer(): 

    data = request.get_json()

    offer_id = data.get('offer_id', None)
    user_id = data.get('user_id', '')
    title = data.get('title', '')
    comment = data.get('comment','')
    category = data.get('category', '').lower()

    if not offer_id:
        return jsonify({"error": "offer_id is required"}), 400

    keywords = extract_keywords(title)
    clear_title = clean_text(title)
    clear_comment = clean_text(comment)
    sentiment = analyze_sentiment(clear_comment)

    emb_title = text_to_embeddings(clear_title)
    emb_comment = text_to_embeddings(clear_comment)

    # --- Gestión inteligente en ChromaDB ---
    chroma_ids = [f"{offer_id}_title", f"{offer_id}_comment"]

    # Verificar si ya existen y eliminar antes de agregar
    try:
        existing = current_app.collection.get(ids=chroma_ids)
        if existing['ids']:  # Si ya existen
            current_app.collection.delete(ids=chroma_ids)
            print(f"Deleted existing embeddings for offer {offer_id}")
    except Exception as e:
        print(f"Error checking existing embeddings: {e}")

    # Agregar los nuevos 
    current_app.collection.add(
        ids=chroma_ids,
        embeddings=[emb_title, emb_comment],  
        metadatas=[
            {"offer_id": offer_id, "type": "title", "category": category},
            {"offer_id": offer_id, "type": "comment", "category": category},
        ]
    )

    
    is_existing = get_offer_analysis(offer_id)
    # --- Guardar/Actualizar análisis NLP en PostgreSQL ---
    upsert_offer_analysis(offer_id, keywords, sentiment, False, False)
    
    # Solo insertar historial si es una nueva publicación
    # Para ediciones, podrías usar un tipo diferente como "edit"
    if not is_existing:  # Si no existe
        insert_history(offer_id, user_id, "pub")
        
  
    
    return jsonify({"message": "Offer processed successfully", "action": "upsert"}), 200