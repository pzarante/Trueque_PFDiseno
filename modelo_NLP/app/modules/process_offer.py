from flask import Blueprint, request, jsonify
import re
import string
from stopwordsiso import stopwords
import spacy

process_offer = Blueprint('process_offer', __name__)

spcy = spacy.load("es_core_news_sm")

def extract_keywords(text):
    doc = spcy(text.lower())
    
    keywords = []
    for token in doc:
        # Filtrar: palabras no stop, longitud mínima, y partes del speech relevantes
        if (not token.is_stop and 
            len(token.text) > 2 and 
            token.pos_ in ["NOUN", "PROPN", "ADJ"]):
            
            # Usar el lema (forma base) en lugar del texto
            keywords.append(token.text)
    
    return list(set(keywords))  # Eliminar duplicados


@process_offer.route('/nlp/create_offer', methods=['POST'])
def create_offer():
    data = request.get_json()
    
    title = data.get('title', '')
    category = data.get('category', '')
    
    #clean_title = clean_text(title)
    #clean_category = clean_text(category)
    keywords = extract_keywords(title)

    response = {
        "id": data.get('id', None),
        "category": category.lower(),
        "keywords": keywords
    }
    return jsonify(response)
