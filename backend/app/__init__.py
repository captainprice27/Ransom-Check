from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config['UPLOAD_FOLDER'] = 'uploads'

    from app.routes import api
    app.register_blueprint(api)

    return app
