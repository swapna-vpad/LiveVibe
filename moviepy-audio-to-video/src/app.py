from flask import Flask, request, render_template, send_file
from utils.converter import convert_audio_to_video
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    if 'audio_file' not in request.files:
        return "No file part", 400
    
    file = request.files['audio_file']
    
    if file.filename == '':
        return "No selected file", 400
    
    if file:
        audio_path = os.path.join('uploads', file.filename)
        file.save(audio_path)
        
        video_path = convert_audio_to_video(audio_path)
        
        return send_file(video_path, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)