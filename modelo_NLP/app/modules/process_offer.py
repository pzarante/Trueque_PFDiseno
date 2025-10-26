from flask import Blueprint, request, jsonify
from app.chroma_BD.chroma import get_chroma_collection
from app.services.nlp_processor import extract_keywords, clean_text, analyze_sentiment, text_to_embeddings
from app.postgres_DB.postgres import get_connection

process_offer = Blueprint('process_offer', __name__)


@process_offer.route('/nlp/create_offer', methods=['POST'])
def create_offer():

    data = request.get_json()

    id = data.get('id', None)
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
    collection = get_chroma_collection()    
    chroma_ids = [f"{id}_title", f"{id}_comment"]

    collection.add(
    ids=[f"{id}_title", f"{id}_comment"],
    ids=chroma_ids,
    embeddings=[emb_title, emb_comment],  
    metadatas=[
        {"offer_id": id, "type": "title", "category": category.lower()},
        {"offer_id": id, "type": "comment", "category": category.lower()},
    ]
    )
    
    # --- Guardar análisis NLP en Supabase/PostgreSQL ---
    conn = get_connection()
    cur = conn.cursor()

    # Verificar si ya existe el registro para esta oferta
    cur.execute("SELECT id FROM offer_nlp_analysis WHERE offer_id = %s;", (id,))
    existing = cur.fetchone()

    if existing:
        # Actualizar registro existente
        cur.execute("""
            UPDATE offer_nlp_analysis
            SET keywords = %s,
                sentiment = %s,
                confidence = %s,
                polarity = %s,
                subjectivity = %s,
                chroma_ids = %s,
                processed_at = NOW()
            WHERE offer_id = %s;
        """, (
            keywords,
            sentiment["sentiment"],
            sentiment["confidence"],
            sentiment["polarity"],
            sentiment["subjectivity"],
            chroma_ids,
            id
        ))
    else:
        # Insertar nuevo registro
        cur.execute("""
            INSERT INTO offer_nlp_analysis (
                offer_id, keywords, sentiment, confidence, polarity, subjectivity, chroma_ids
            ) VALUES (%s, %s, %s, %s, %s, %s, %s);
        """, (
            id,
            keywords,
            sentiment["sentiment"],
            sentiment["confidence"],
            sentiment["polarity"],
            sentiment["subjectivity"],
            chroma_ids
        ))

    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({"message": "Documents added successfully", "ids": id}), 200




   # analitycs = {
      #  "id": data.get('id', None),
       # "keywords": keywords,
       # "sentiment": sentiment,
       # "emb_title": emb_title.tolist()
        
        #"embedding": vector.tolist()
    #}
    #return jsonify(analitycs)
