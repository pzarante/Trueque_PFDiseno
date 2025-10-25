from flask import Blueprint, request, jsonify
from app.services.nlp_processor import extract_keywords, clean_text, analyze_sentiment, text_to_embeddings

process_offer = Blueprint('process_offer', __name__)


@process_offer.route('/nlp/create_offer', methods=['POST'])
def create_offer():

    data = request.get_json()
    
    title = data.get('title', '')
    comment = data.get('comment','')
    category = data.get('category', '')
    
   
    keywords = extract_keywords(title)
    
    clear_title = clean_text(title)
    clear_comment = clean_text(comment)

    sentiment = analyze_sentiment(clear_comment)

    emb_title = text_to_embeddings(clear_title)
    emb_comment = text_to_embeddings(clear_comment)

    

    analitycs = {
        "id": data.get('id', None),
        "keywords": keywords,
        "sentiment": sentiment,
        "emb_title": emb_title.tolist()
        
        #"embedding": vector.tolist()
    }
    return jsonify(analitycs)
