from flask import Blueprint

create_offer = Blueprint('create_offer', __name__)

@create_offer.route('/nlp/create_offer', methods=['GET'])
def create_offers():
    return True