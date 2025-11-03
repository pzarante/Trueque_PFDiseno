from flask import Blueprint, request,jsonify, current_app
import numpy as np
from app.postgres_DB.postgres import get_user_publication_history, get_user_consultation_history, get_multiple_offers_keywords

recommendations = Blueprint('recommendations', __name__)


@recommendations.route('/nlp/recommendations', methods=['POST'])
def recommendation():

    data = request.get_json()

    user_id = data.get('user_id', None)

    publication = get_user_publication_history(user_id)
    consult = get_user_consultation_history(user_id)



    offer_ids = consult + publication
    
     # Crear los IDs usados en ChromaDB
    chroma_ids = []
    for offer_id in offer_ids:
        chroma_ids.extend([f"{offer_id}_title", f"{offer_id}_comment"])
    
    # Consultar ChromaDB
    results = current_app.collection.get(
        ids=chroma_ids,
        include=["embeddings", "metadatas"]
    )
    
    # Organizar los resultados
    offer_embeddings = {}
    
    for i, metadata in enumerate(results["metadatas"]):
        offer_id = metadata["offer_id"]
        embed_type = metadata["type"]  # "title" o "comment"
        embedding = results["embeddings"][i]
        
        if offer_id not in offer_embeddings:
            offer_embeddings[offer_id] = {}
        
        offer_embeddings[offer_id][embed_type] = embedding.tolist()



    # PASO 1: Calcular embedding promedio del usuario
    all_embeddings = []
    for offer_data in offer_embeddings.values():
        all_embeddings.extend([offer_data["title"], offer_data["comment"]])

    # Calcular promedio de todos los embeddings
    user_profile_embedding = np.mean(all_embeddings, axis=0).tolist()

    results = current_app.collection.query(
        query_embeddings=[user_profile_embedding],
        n_results=10,  # Número de recomendaciones
    )
    
    # PASO 3: Formatear respuesta
    recommended_offer_ids = []

    for chroma_id in results["ids"][0]:
        offer_id = chroma_id.replace("_title", "").replace("_comment", "")
        
        # Excluir ofertas que ya están en el historial del usuario 
        if offer_id not in str(offer_ids):
            recommended_offer_ids.append(offer_id)
      

    # Después de obtener recommended_offer_ids
    #los keywords son solo para pruebas
    keywords_dict = get_multiple_offers_keywords(recommended_offer_ids)

    offers_with_keywords = []
    for offer_id in recommended_offer_ids:  # Este orden ahora es por similitud
        offers_with_keywords.append({
            "offer_id": offer_id,
            "keywords": keywords_dict.get(offer_id, [])
        })

    return jsonify({
        "recommended_offers": offers_with_keywords
    })

