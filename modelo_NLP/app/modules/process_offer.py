from flask import Blueprint, request, jsonify
import re
import string
from stopwordsiso import stopwords
import spacy

process_offer = Blueprint('process_offer', __name__)

# Cargar stopwords en español
STOPWORDS_ES = stopwords("es")

spcy = spacy.load("es_core_news_sm")

def extract_keywords(text):
    doc = spcy(text)
    return [token.text for token in doc if token.pos_ in ["NOUN", "PROPN", "ADJ"]]

def clean_text(text):
    # Convertir a minúsculas
    text = text.lower()
    
    # Eliminar puntuación y números
    text = re.sub(rf"[{re.escape(string.punctuation)}]", " ", text)
    text = re.sub(r"\d+", "", text)
    
    # Tokenizar por espacios
    tokens = text.split()
    
    # Eliminar stopwords y palabras vacías
    tokens = [word for word in tokens if word.isalpha() and word not in STOPWORDS_ES]
    
    # Volver a unir el texto limpio
    return " ".join(tokens)

@process_offer.route('/nlp/create_offer', methods=['POST'])
def create_offer():
    data = request.get_json()
    
    title = data.get('title', '')
    category = data.get('category', '')
    
    clean_title = clean_text(title)
    clean_category = clean_text(category)
    keywords = extract_keywords(title)
    response = {
        "id": data.get('id', None),
        "title": clean_title,
        "category": clean_category,
        "keywords": keywords
    }
    return jsonify(response)
