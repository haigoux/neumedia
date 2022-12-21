import youtube_dl as ydl
import os
import sys
import json
import flask
import time
from flask import Flask, request, redirect, url_for, render_template, send_from_directory, jsonify
from flask_cors import CORS, cross_origin

from backend import Downloader

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/metadata', methods=['GET'])
@cross_origin()
def get_metadata():
    # get the url from the request parameters
    url = request.args.get('url')
    dl = Downloader()
    return jsonify(dl.get_metadata(url))

app.run(host='localhost', port=5000, debug=True)