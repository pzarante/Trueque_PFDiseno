# app/__init__.py
from flask import Flask, current_app

# Imports con manejo de errores para cuando los paquetes no estén instalados
try:
    import spacy  # type: ignore
except ImportError:
    spacy = None  # type: ignore

try:
    from sentence_transformers import SentenceTransformer  # type: ignore
except ImportError:
    SentenceTransformer = None  # type: ignore

try:
    from pysentimiento import create_analyzer  # type: ignore
except ImportError:
    create_analyzer = None  # type: ignore

def create_app():
    app = Flask(__name__)
    
    # Cargar modelos NLP
    print("Cargando modelos NLP...")
    try:
        if spacy is None:
            raise ImportError("spacy no está instalado. Instálalo con: pip install spacy")
        app.spacy_model = spacy.load("es_core_news_sm")
        print("Spacy model cargado")
    except Exception as e:
        print(f"Error cargando Spacy: {e}")
        raise
    
    try:
        if SentenceTransformer is None:
            raise ImportError("sentence-transformers no está instalado. Instálalo con: pip install sentence-transformers")
        app.embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("SentenceTransformer model cargado")
    except Exception as e:
        print(f"Error cargando SentenceTransformer: {e}")
        raise
    
    try:
        if create_analyzer is None:
            raise ImportError("pysentimiento no está instalado. Instálalo con: pip install pysentimiento")
        app.sentiment_analyzer = create_analyzer(task="sentiment", lang="es")
        print("Sentiment analyzer cargado")
    except Exception as e:
        print(f"Error cargando sentiment analyzer: {e}")
        raise
    
    # Inicializar ChromaDB collection en cada request si no existe
    @app.before_request
    def initialize_collection():
        if not hasattr(current_app, 'collection') or current_app.collection is None:
            try:
                from app.chroma_BD.chroma import get_chroma_collection
                current_app.collection = get_chroma_collection()
            except Exception as e:
                print(f"Error inicializando ChromaDB en request: {e}")
                current_app.collection = None
    
    # Intentar inicializar collection al crear la app
    try:
        from app.chroma_BD.chroma import get_chroma_collection
        with app.app_context():
            app.collection = get_chroma_collection()
            print("ChromaDB collection inicializada")
    except Exception as e:
        print(f"Advertencia: No se pudo inicializar ChromaDB al inicio: {e}")
        print("Se intentará inicializar en la primera solicitud")

    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return {
            'status': 'OK',
            'timestamp': __import__('datetime').datetime.now().isoformat(),
            'service': 'modelo-nlp'
        }, 200

    # Registrar blueprints
    from app.modules.process_offer import process_offer
    from app.modules.semantic_search import semantic_search
    from app.modules.bulk_insert import bulk_insert
    from app.modules.recommendations import recommendations
<<<<<<< HEAD
    from app.modules.messages import messages
=======
    from app.modules.register_consult import register_consult
    from app.modules.bulk_history import bulk_history
    from app.modules.evaluate_bp import evaluate_bp
>>>>>>> modelo_NLP_bemontoya

    app.register_blueprint(process_offer)
    app.register_blueprint(semantic_search)
    app.register_blueprint(recommendations)
    app.register_blueprint(bulk_insert)
<<<<<<< HEAD
    app.register_blueprint(messages)
=======
    app.register_blueprint(register_consult)
    app.register_blueprint(bulk_history)
    app.register_blueprint(evaluate_bp)

>>>>>>> modelo_NLP_bemontoya
    
    print("Aplicación Flask configurada correctamente")
    return app