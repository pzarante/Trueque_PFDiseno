from flask import Flask

from app.modules.process_offer import process_offer
from app.modules.process_comment import process_comment

app = Flask(__name__)

app.register_blueprint(process_offer)
app.register_blueprint(process_comment)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)