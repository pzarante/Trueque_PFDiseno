import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise ValueError("Variables SUPABASE_URL o SUPABASE_KEY no definidas en .env")
    return create_client(url, key)

def insert_offer_analysis(offer_id, keywords, sentiment, needs_title_reindex, needs_comment_reindex):
    supabase = get_supabase_client()
    data = {
        "offer_id": offer_id,
        "keywords": keywords,
        "sentiment": sentiment["sentiment"],
        "confidence": sentiment["confidence"],
        "polarity": sentiment["polarity"],
        "subjectivity": sentiment["subjectivity"],
        "needs_title_reindex": needs_title_reindex,
        "needs_comment_reindex": needs_comment_reindex
    }
    supabase.table("offer_nlp_analysis").insert(data).execute()
    return data

def insert_history(offer_id, user_id, type):
    supabase = get_supabase_client()
    data = {
        "id_offer": offer_id,
        "id_user": user_id,
        "type": type
    }
    supabase.table("history").insert(data).execute()
    return data

def get_user_publication_history(user_id):
 
    supabase = get_supabase_client()
    
    response = supabase.table("history")\
        .select("id_offer")\
        .eq("id_user", user_id)\
        .eq("type", "pub")\
        .execute()
    
    return [item["id_offer"] for item in response.data]

def get_user_consultation_history(user_id):
    supabase = get_supabase_client()
    
    response = supabase.table("history")\
        .select("id_offer")\
        .eq("id_user", user_id)\
        .eq("type", "con")\
        .execute()
    
    return [item["id_offer"] for item in response.data]

def get_multiple_offers_keywords(offer_ids):
    """Obtiene keywords para múltiples ofertas en una sola consulta"""
    try:
        supabase = get_supabase_client()
        
        # CONVERTIR los offer_ids de string a int
        offer_ids_int = [int(offer_id) for offer_id in offer_ids]

        response = supabase.table("offer_nlp_analysis")\
            .select("offer_id, keywords")\
            .in_("offer_id", offer_ids_int)\
            .execute()
        
        # Convertir a diccionario para fácil acceso
        return {str(item["offer_id"]): item["keywords"] for item in response.data}
    
    except Exception as e:
        print(f"Error en get_multiple_offers_keywords: {e}")  # DEBUG
        return {}