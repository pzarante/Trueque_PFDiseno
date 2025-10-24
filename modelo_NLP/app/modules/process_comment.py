from flask import Blueprint, request, jsonify
from pysentimiento import create_analyzer
import logging



process_comment = Blueprint('process_comment', __name__)

try:
    analyzer = create_analyzer(task="sentiment", lang="es")
    logging.info("Analyzer de sentimiento cargado correctamente")
except Exception as e:
    logging.error(f"Error cargando analyzer: {e}")
    analyzer = None

def analyze_sentiment(comment):
    resultado = analyzer.predict(comment)
    
    # Mapear a español
    sentiment_map = {
        "POS": "positivo",
        "NEG": "negativo", 
        "NEU": "neutral"
    }
    
    # La confianza es la probabilidad más alta entre todas las clases
    confidence = max(resultado.probas.values())
    
    return {
        "polarity": round(resultado.probas["POS"] - resultado.probas["NEG"], 3),
        "subjectivity": round(1 - resultado.probas["NEU"], 3),
        "sentiment": sentiment_map[resultado.output],
        "confidence": round(confidence, 3)  # ← Confianza agregada aquí
    }

@process_comment.route('/nlp/analyze_comment', methods=['POST'])
def analyze_comment():
    data = request.get_json()
    comment = data.get("comment", "")
    
    if not comment.strip():
        return jsonify({"error": "El comentario está vacío"}), 400
    
    sentiment = analyze_sentiment(comment)
    
    return jsonify({
        "comment": comment,
        "sentiment": sentiment
    })