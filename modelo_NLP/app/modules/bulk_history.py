from flask import Blueprint, request, jsonify
from app.postgres_DB.postgres import insert_history

bulk_history = Blueprint('bulk_history', __name__)

@bulk_history.route('/nlp/bulk_history', methods=['POST'])
def bulk_history_insert():
    data = request.get_json()

    if not isinstance(data, list) or len(data) == 0:
        return jsonify({"error": "Se requiere una lista de elementos para el historial"}), 400

    inserted = 0
    errors = []

    for item in data:

        offer_id = item.get("offer_id")
        user_id = item.get("user_id")

        if not offer_id or not user_id:
            errors.append({
                "item": item,
                "error": "offer_id y user_id son obligatorios"
            })
            continue  # Saltar al siguiente elemento

        try:
            insert_history(offer_id, user_id, "con")  # SOLO CONSULTAS
            inserted += 1

        except Exception as e:
            errors.append({
                "item": item,
                "error": str(e)
            })

    response = {
        "inserted": inserted,
        "errors": errors,
        "status": "partial" if errors else "success"
    }

    return jsonify(response), (207 if errors else 200)
