from flask import Blueprint, request, jsonify
from app.chroma_BD.chroma import get_chroma_collection
from app.services.nlp_processor import extract_keywords, clean_text, analyze_sentiment, text_to_embeddings
from app.postgres_DB.postgres import insert_offer_analysis, insert_posting_history

process_offer = Blueprint('process_offer', __name__)


@process_offer.route('/nlp/create_offer', methods=['POST'])
def create_offer():

    data = request.get_json()

    id = data.get('id', None)
    title = data.get('title', '')
    comment = data.get('comment','')
    category = data.get('category', '')
    user = data.get('user', '')


    keywords = extract_keywords(title)

    clear_title = clean_text(title)
    clear_comment = clean_text(comment)

    sentiment = analyze_sentiment(clear_comment)

    emb_title = text_to_embeddings(clear_title)
    emb_comment = text_to_embeddings(clear_comment)

    # --- Guardar en ChromaDB ---
    collection = get_chroma_collection()
    chroma_ids = [f"{id}_title", f"{id}_comment"]

    collection.add(
    ids=chroma_ids,
    embeddings=[emb_title, emb_comment],  
    metadatas=[
        {"offer_id": id, "type": "title", "category": category.lower()},
        {"offer_id": id, "type": "comment", "category": category.lower()},
    ]
    )

    # --- Guardar análisis NLP en Supabase/PostgreSQL ---
    insert_offer_analysis(id, keywords, sentiment)
    insert_posting_history(id, user)

    return jsonify({"message": "Documents added successfully", "ids": id}), 200




   # analitycs = {
      #  "id": data.get('id', None),
       # "keywords": keywords,
       # "sentiment": sentiment,
       # "emb_title": emb_title.tolist()

        #"embedding": vector.tolist()
    #}
    #return jsonify(analitycs)
