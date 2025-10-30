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