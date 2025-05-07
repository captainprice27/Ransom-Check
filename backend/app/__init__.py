from flask import Flask
from flask_cors import CORS  # ✅ Import CORS

def create_app():
    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = 'uploads'

    CORS(app)  # ✅ Enable CORS for the whole app

    from app.routes import api
    app.register_blueprint(api)

    return app
