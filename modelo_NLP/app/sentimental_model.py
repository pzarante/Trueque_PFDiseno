from pysentimiento import create_analyzer
import logging

_sentiment_analyzer = None

def get_sentiment_analyzer():
    global _sentiment_analyzer
    
    if _sentiment_analyzer is None:
        try:
            logging.info("Cargando analyzer de sentimiento...")
            _sentiment_analyzer = create_analyzer(task="sentiment", lang="es")
            logging.info("Analyzer de sentimiento cargado correctamente")
        except Exception as e:
            logging.error(f"Error cargando analyzer: {e}")
            raise
    
    return _sentiment_analyzer

def analyze_sentiment(text):
    if not text or not text.strip():
        return {
            "sentiment": "neutral",
            "confidence": 0.0,
            "polarity": 0.0,
            "subjectivity": 0.0
        }
    
    analyzer = get_sentiment_analyzer()
    resultado = analyzer.predict(text)
    
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