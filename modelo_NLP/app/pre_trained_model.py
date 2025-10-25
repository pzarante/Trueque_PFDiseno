from sentence_transformers import SentenceTransformer
import logging


_model = None

def get_embedding_model():

    global _model
    
    if _model is None:
        try:
            logging.info("Cargando modelo de embeddings...")
            _model = SentenceTransformer(
                'paraphrase-multilingual-MiniLM-L12-v2',
                device='cpu'  # Cambiar a 'cuda' si tienes GPU
            )
            logging.info("Modelo de embeddings cargado exitosamente")
        except Exception as e:
            logging.error(f"Error cargando el modelo: {e}")
            raise
    
    return _model

def text_to_embeddings(text):
    model = get_embedding_model()
    return model.encode(text, normalize_embeddings=True)

def texts_to_embeddings(texts):
    model = get_embedding_model()
    return model.encode(texts, normalize_embeddings=True, batch_size=32)