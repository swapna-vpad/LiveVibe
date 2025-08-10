from flask import Flask, request, send_file
from flask_cors import CORS
from moviepy.editor import AudioFileClip, ColorClip
import os
import uuid

app = Flask(__name__)
CORS(app)

@app.route('/convert', methods=['POST'])
def convert():
    audio = request.files['audio']
    filename = f"temp_{uuid.uuid4()}.mp3"
    audio.save(filename)

    # Create a simple color background video
    audioclip = AudioFileClip(filename)
    videoclip = ColorClip(size=(1280, 720), color=(30, 30, 30), duration=audioclip.duration)
    videoclip = videoclip.set_audio(audioclip)
    outname = f"output_{uuid.uuid4()}.mp4"
    videoclip.write_videofile(outname, fps=24, codec="libx264", audio_codec="aac")

    os.remove(filename)
    return send_file(outname, as_attachment=True, download_name="output.mp4")

if __name__ == '__main__':
    app.run(port=5000)