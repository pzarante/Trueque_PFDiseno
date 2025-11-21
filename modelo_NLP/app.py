from app import create_app

app = create_app()

with app.app_context():
    try:
        # Precargar ChromaDB 
        from app.chroma_BD.chroma import get_chroma_collection
        try:
            app.collection = get_chroma_collection()
            print("ChromaDB collection precargada")
        except Exception as chroma_error:
            print(f"Advertencia al precargar ChromaDB: {chroma_error}")
            app.collection = None
        
        # Forzar precarga de embeddings usando los modelos ya cargados
        dummy_text = "precarga de modelos nlp"
        try:
            embeddings = app.embedding_model.encode(dummy_text)
            sentiment = app.sentiment_analyzer.predict(dummy_text)
            print("Modelos NLP precargados correctamente")
        except Exception as model_error:
            print(f"Error precargando modelos: {model_error}")
        
    except Exception as e:
        print(f"Error precargando recursos: {e}")

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)