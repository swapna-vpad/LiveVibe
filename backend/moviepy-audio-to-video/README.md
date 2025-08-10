# MoviePy Audio to Video Converter

This project is a simple web application that allows users to convert audio files into video format using MoviePy. The application is built with Flask and provides a user-friendly interface for uploading audio files and generating corresponding video files.

## Project Structure

```
moviepy-audio-to-video
├── src
│   ├── app.py
│   └── utils
│       └── converter.py
├── requirements.txt
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd moviepy-audio-to-video
   ```

2. **Install the required packages:**
   Make sure you have Python installed, then run:
   ```
   pip install -r requirements.txt
   ```

3. **Run the application:**
   Start the Flask server by executing:
   ```
   python src/app.py
   ```

4. **Access the application:**
   Open your web browser and navigate to `http://127.0.0.1:5000` to access the audio to video converter interface.

## Usage

1. Click on the "Upload your audio file" button to select an audio file from your device.
2. After selecting the file, click the "Convert" button to start the conversion process.
3. Once the conversion is complete, the video file will be available for download.

## Dependencies

- Flask
- MoviePy

Make sure to check the `requirements.txt` file for the specific versions of the dependencies used in this project.

## License

This project is licensed under the MIT License. Feel free to modify and use it as per your needs.