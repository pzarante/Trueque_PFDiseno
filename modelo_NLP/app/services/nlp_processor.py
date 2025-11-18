from flask import current_app
import re

def text_to_embeddings(text):
    return current_app.embedding_model.encode(text, normalize_embeddings=True)

def analyze_sentiment(text):
    if not text or not text.strip():
        return {
            "sentiment": "neutral",
            "confidence": 0.0,
            "polarity": 0.0,
            "subjectivity": 0.0
        }
    
    
    resultado = current_app.sentiment_analyzer.predict(text)
    # Mapear a español
    sentiment_map = {
        "POS": "positivo",
        "NEG": "negativo", 
        "NEU": "neutral"
    }
    
    confidence = max(resultado.probas.values())
    
    return {
        "sentiment": sentiment_map[resultado.output],
        "confidence": round(confidence, 3),
        "polarity": round(resultado.probas["POS"] - resultado.probas["NEG"], 3),
        "subjectivity": round(1 - resultado.probas["NEU"], 3)
    }


def clean_text(text):
    if not isinstance(text, str):
        return ""

    text = text.lower()
    
    text = re.sub(r'[^\w\s.,\-¿?¡!áéíóúñü]', ' ', text)
    
    # 3. Normalizar espacios
    text = re.sub(r'\s+', ' ', text)

    
    return text.strip()

def extract_keywords(text):
    doc = current_app.spacy_model(text.lower())
    
    keywords = []
    for token in doc:
        # Filtrar: palabras no stop, longitud mínima, y partes del speech relevantes
        if (not token.is_stop and 
            len(token.text) > 2 and 
            token.pos_ in ["NOUN", "PROPN", "ADJ"]):
            
            # Usar el lema (forma base) en lugar del texto
            keywords.append(token.text)
    
    return list(set(keywords))  # Eliminar duplicados

