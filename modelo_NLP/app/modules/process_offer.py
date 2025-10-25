from flask import Blueprint, request, jsonify
import spacy
import re


from app.embedding_model import text_to_embeddings
from app.sentimental_model import analyze_sentiment

process_offer = Blueprint('process_offer', __name__)

spcy = spacy.load("es_core_news_sm")


def clean_text(text):
    if not isinstance(text, str):
        return ""

    text = text.lower()
    
    text = re.sub(r'[^\w\s.,\-¿?¡!áéíóúñü]', ' ', text)
    
    # 3. Normalizar espacios
    text = re.sub(r'\s+', ' ', text)

    
    return text.strip()

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
