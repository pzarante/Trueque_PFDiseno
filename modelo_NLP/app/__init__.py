# app/__init__.py
from flask import Flask
import spacy
from sentence_transformers import SentenceTransformer
from pysentimiento import create_analyzer

def create_app():
    app = Flask(__name__)
    
    # Cargar modelos
    app.spacy_model = spacy.load("es_core_news_sm")
    app.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
    app.sentiment_analyzer = create_analyzer(task="sentiment", lang="es")
    

    # Registrar blueprints
    from app.modules.process_offer import process_offer
    from app.modules.semantic_search import semantic_search
    from app.modules.bulk_insert import bulk_insert
    from app.modules.recommendations import recommendations

    
    app.register_blueprint(process_offer)
    app.register_blueprint(semantic_search)
    app.register_blueprint(recommendations)
    app.register_blueprint(bulk_insert)
    
    return app