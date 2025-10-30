from flask import Blueprint, request,jsonify
from app.postgres_DB.postgres import get_user_publication_history, get_user_consultation_history

recommendations = Blueprint('recommendations', __name__)


@recommendations.route('/nlp/recommendations', methods=['POST'])
def recommendation():

    data = request.get_json()

    user_id = data.get('user_id', None)

    publication = get_user_publication_history(user_id)
    consult = get_user_consultation_history(user_id)

    return jsonify({
        "publication": publication,
        "consult": consult
    })