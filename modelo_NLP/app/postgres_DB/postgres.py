import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def get_connection():
    try:
        conn = psycopg2.connect(
            os.getenv("SUPABASE_DB_URL"),
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"[ERROR] No se pudo conectar a la base de datos: {e}")
        raise

def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise ValueError("Variables SUPABASE_URL o SUPABASE_KEY no definidas en .env")
    return create_client(url, key)

def insert_offer_analysis(offer_id, keywords, sentiment):
    supabase = get_supabase_client()
    data = {
        "offer_id": offer_id,
        "keywords": keywords,
        "sentiment": sentiment["sentiment"],
        "confidence": sentiment["confidence"],
        "polarity": sentiment["polarity"],
        "subjectivity": sentiment["subjectivity"],
    }
    supabase.table("offer_nlp_analysis").insert(data).execute()
    return data

def insert_posting_history(offer_id, user_id):
    supabase = get_supabase_client()
    data = {
        "id_offer": offer_id,
        "id_user": user_id
    }
    supabase.table("posting_history").insert(data).execute()
    return data