from flask import Blueprint, request, jsonify, current_app
from app.services.nlp_processor import extract_keywords, clean_text, analyze_sentiment, text_to_embeddings
from app.postgres_DB.postgres import insert_offer_analysis, insert_posting_history

process_offer = Blueprint('process_offer', __name__)


@process_offer.route('/nlp/create_offer', methods=['POST'])
def create_offer():

    data = request.get_json()

    offer_id = data.get('offer_id', None)
    user_id = data.get('user_id', '')
    title = data.get('title', '')
    comment = data.get('comment','')
    category = data.get('category', '')
    


    keywords = extract_keywords(title)

    clear_title = clean_text(title)
    clear_comment = clean_text(comment)

    sentiment = analyze_sentiment(clear_comment)

    emb_title = text_to_embeddings(clear_title)
    emb_comment = text_to_embeddings(clear_comment)

    # --- Guardar en ChromaDB ---
    
    chroma_ids = [f"{offer_id}_title", f"{offer_id}_comment"]

    current_app.collection.add(
    ids=chroma_ids,
    embeddings=[emb_title, emb_comment],  
    metadatas=[
        {"offer_id": offer_id, "type": "title", "category": category.lower()},
        {"offer_id": offer_id, "type": "comment", "category": category.lower()},
    ]
    )
    # --- Guardar análisis NLP en Supabase/PostgreSQL ---
    insert_offer_analysis(offer_id, keywords, sentiment)
    insert_posting_history(offer_id, user_id)

    return jsonify({"message": "Documents added successfully"}), 200

