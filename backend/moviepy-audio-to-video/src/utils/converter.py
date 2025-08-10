from moviepy.editor import AudioFileClip, ImageClip, CompositeVideoClip

def convert_audio_to_video(audio_file_path, output_video_path, image_file_path='static/image.jpg'):
    # Load the audio file
    audio_clip = AudioFileClip(audio_file_path)
    
    # Create a video clip with a static image
    image_clip = ImageClip(image_file_path).set_duration(audio_clip.duration)
    
    # Set the audio of the video clip
    video_clip = image_clip.set_audio(audio_clip)
    
    # Write the result to a file
    video_clip.write_videofile(output_video_path, codec='libx264', audio_codec='aac')
    
    # Close the clips
    audio_clip.close()
    video_clip.close()