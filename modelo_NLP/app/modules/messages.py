from flask import Blueprint, request, jsonify, current_app
from app.services.nlp_processor import clean_text, text_to_embeddings, analyze_sentiment
from app.chroma_BD.chroma import get_chroma_client

messages = Blueprint('messages', __name__)

@messages.route('/nlp/process_message', methods=['POST'])
def process_message():
    """
    Procesa un mensaje con NLP y guarda el embedding en ChromaDB
    Esto permite búsqueda semántica en conversaciones
    """
    try:
        data = request.get_json()
        
        message_id = data.get('message_id')
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        message_text = data.get('message', '')
        trade_id = data.get('trade_id', None)
        conversation_id = data.get('conversation_id', None)
        
        if not message_id or not message_text:
            return jsonify({"error": "message_id y message son requeridos"}), 400
        
        # Procesar el mensaje con NLP
        clean_message = clean_text(message_text)
        sentiment = analyze_sentiment(clean_message)
        message_embedding = text_to_embeddings(clean_message)
        
        # Obtener colección de mensajes (crear si no existe)
        chroma_client = get_chroma_client()
        try:
            messages_collection = chroma_client.get_collection(name="messages_embeddings")
        except:
            messages_collection = chroma_client.create_collection(name="messages_embeddings")
        
        # Guardar embedding del mensaje
        messages_collection.add(
            ids=[f"{message_id}"],
            embeddings=[message_embedding.tolist()],
            metadatas=[{
                "message_id": message_id,
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "message": clean_message,
                "original_message": message_text[:500],
                "sentiment": sentiment.get("sentiment", "neutral"),
                "trade_id": trade_id or "",
                "conversation_id": conversation_id or f"{sender_id}_{receiver_id}"
            }]
        )
        
        return jsonify({
            "message": "Mensaje procesado exitosamente",
            "sentiment": sentiment,
            "message_id": message_id
        }), 200
        
    except Exception as e:
        print(f"Error procesando mensaje: {e}")
        return jsonify({"error": str(e)}), 500

@messages.route('/nlp/search_messages', methods=['GET'])
def search_messages():
    """
    Búsqueda semántica en mensajes usando embeddings
    """
    try:
        query_text = request.args.get("query", "").strip()
        n = int(request.args.get("n", 10))
        conversation_id = request.args.get("conversation_id", None)
        sender_id = request.args.get("sender_id", None)
        
        if not query_text:
            return jsonify({"error": "Parámetro 'query' es obligatorio"}), 400
        
        clean_query = clean_text(query_text)
        query_embedding = text_to_embeddings(clean_query)
        
        # Obtener colección de mensajes
        chroma_client = get_chroma_client()
        try:
            messages_collection = chroma_client.get_collection(name="messages_embeddings")
        except:
            return jsonify({"error": "No hay mensajes indexados"}), 404
        
        # Construir filtro
        where_filter = {}
        if conversation_id:
            where_filter["conversation_id"] = conversation_id
        if sender_id:
            where_filter["sender_id"] = sender_id
        
        where_filter = where_filter if where_filter else None
        
        # Buscar mensajes similares
        results = messages_collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n,
            where=where_filter
        )
        
        messages = []
        for i, metadata in enumerate(results["metadatas"][0]):
            distance = results["distances"][0][i]
            score = max(0.0, 1.0 - distance / 2.0)
            
            messages.append({
                "message_id": metadata["message_id"],
                "sender_id": metadata["sender_id"],
                "receiver_id": metadata["receiver_id"],
                "message": metadata["original_message"],
                "sentiment": metadata.get("sentiment", "neutral"),
                "trade_id": metadata.get("trade_id"),
                "conversation_id": metadata.get("conversation_id"),
                "score": round(score, 4)
            })
        
        return jsonify({"results": messages}), 200
        
    except Exception as e:
        print(f"Error buscando mensajes: {e}")
        return jsonify({"error": str(e)}), 500

@messages.route('/nlp/conversation_sentiment', methods=['GET'])
def conversation_sentiment():
    """
    Analiza el sentimiento general de una conversación
    """
    try:
        conversation_id = request.args.get("conversation_id", None)
        
        if not conversation_id:
            return jsonify({"error": "conversation_id es requerido"}), 400
        
        chroma_client = get_chroma_client()
        try:
            messages_collection = chroma_client.get_collection(name="messages_embeddings")
        except:
            return jsonify({"error": "No hay mensajes indexados"}), 404
        
        # Obtener todos los mensajes de la conversación
        results = messages_collection.get(
            where={"conversation_id": conversation_id},
            include=["metadatas"]
        )
        
        if not results["metadatas"]:
            return jsonify({"error": "Conversación no encontrada"}), 404
        
        sentiments = [meta.get("sentiment", "neutral") for meta in results["metadatas"]]
        positive_count = sentiments.count("positivo")
        negative_count = sentiments.count("negativo")
        neutral_count = sentiments.count("neutral")
        
        total = len(sentiments)
        
        overall_sentiment = "neutral"
        if positive_count > negative_count:
            overall_sentiment = "positivo"
        elif negative_count > positive_count:
            overall_sentiment = "negativo"
        
        return jsonify({
            "conversation_id": conversation_id,
            "overall_sentiment": overall_sentiment,
            "total_messages": total,
            "positive": positive_count,
            "negative": negative_count,
            "neutral": neutral_count,
            "sentiment_distribution": {
                "positive": round(positive_count / total * 100, 2) if total > 0 else 0,
                "negative": round(negative_count / total * 100, 2) if total > 0 else 0,
                "neutral": round(neutral_count / total * 100, 2) if total > 0 else 0
            }
        }), 200
        
    except Exception as e:
        print(f"Error analizando sentimiento de conversación: {e}")
        return jsonify({"error": str(e)}), 500

