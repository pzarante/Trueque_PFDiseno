from flask import Flask

from app.modules.create_offer import create_offer

app = Flask(__name__)

app.register_blueprint(create_offer)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)