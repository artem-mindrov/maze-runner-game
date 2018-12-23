from flask import Flask, render_template, jsonify, request
from flask_assets import Environment, Bundle
from maze import growing_tree


app = Flask(__name__)
assets = Environment(app)
assets.debug = app.debug
assets.url = app.static_url_path
scss = Bundle('scss/main.scss', filters='pyscss', output='build/main.css')
js = Bundle('js/main.js', filters='jsmin', output='build/main.js')
assets.register('js_all', js)
assets.register('scss_all', scss)


@app.route('/')
def landing():
    return render_template('main.html')


@app.route('/build')
def build_maze():
    return jsonify(growing_tree(int(request.args.get('w')), int(request.args.get('h'))))