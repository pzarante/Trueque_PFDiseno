from flask import Blueprint, request, jsonify
from app.postgres_DB.postgres import insert_history

register_consult = Blueprint('register_consult', __name__)

@register_consult.route('/nlp/register_consult', methods=['POST'])
def add_history():

    data = request.get_json()

    offer_id = data.get('offer_id')
    user_id = data.get('user_id')

    if not offer_id or not user_id:
        return jsonify({"error": "offer_id and user_id are required"}), 400

    try:
        insert_history(offer_id, user_id, "con")

        return jsonify({
            "message": "History entry added successfully",
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
