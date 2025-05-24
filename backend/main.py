from flask import Flask
from flask_cors import CORS
from app.routes import api  # Import your blueprint

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max upload size

# Completely permissive CORS configuration
CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(api)

if __name__ == "__main__":
    app.run()
