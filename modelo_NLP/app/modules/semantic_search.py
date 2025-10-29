from flask import Blueprint, request, jsonify, current_app
from app.services.nlp_processor import clean_text, text_to_embeddings
from app.chroma_BD.chroma import get_chroma_collection

semantic_search = Blueprint('semantic_search', __name__)

@semantic_search.route('/search', methods=['GET'])
def search_offers():

    return jsonify({})