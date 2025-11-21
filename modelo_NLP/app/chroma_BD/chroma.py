from flask import g
import os
from dotenv import load_dotenv

# Imports de chromadb con manejo de errores
try:
    import chromadb  # type: ignore
    try:
        from chromadb.api import ClientAPI  # type: ignore
        from chromadb.api.models.Collection import Collection  # type: ignore
    except ImportError:
        # Versiones más nuevas de chromadb pueden tener una estructura diferente
        ClientAPI = None
        Collection = None
except ImportError:
    chromadb = None
    ClientAPI = None
    Collection = None

load_dotenv()

def get_chroma_client():
    if chromadb is None:
        raise ImportError("chromadb no está instalado. Instálalo con: pip install chromadb")
    
    if 'chroma_client' not in g:
        g.chroma_client = chromadb.CloudClient(
            api_key=os.getenv("CHROMA_API_KEY"),
            tenant=os.getenv("CHROMA_TENANT"),
            database=os.getenv("CHROMA_DATABASE")
        )
    return g.chroma_client
    
def get_chroma_collection():
    if chromadb is None:
        raise ImportError("chromadb no está instalado. Instálalo con: pip install chromadb")
    
    chroma_client = get_chroma_client()
    if 'chroma_collection' not in g:
        g.chroma_collection = chroma_client.get_or_create_collection(name="offers_embeddings")
    return g.chroma_collection