import os
import warnings
import subprocess

import whisper
import playsound
import soundfile as sf
import sounddevice as sd

warnings.filterwarnings("ignore", category=UserWarning)

# Load Whisper model
print("Loading Whisper model...")
model = whisper.load_model("medium")

# Record audio for 5 seconds
FS=24000
print("Recording...")
recording = sd.rec(int(5 * FS), samplerate=FS, channels=1, dtype="float32")
sd.wait()  # Wait until recording is finished
print("Recording finished. Saving to file...")
sf.write("recording.wav", recording, FS)

# Transcribe the audio file
print("Translating audio...")
result = model.transcribe("recording.wav", language="es", task="translate")
transcribed_text = result["text"].strip()
print(transcribed_text)

# Command to execute the playht.js script with the text as an argument
command = ["node", "src/utils/playht.js", transcribed_text]

# Run the command and print the output
process = subprocess.run(command, capture_output=True, text=True, check=True)
print(process.stdout)

# Play the audio file
playsound.playsound("translation.mp3")

# Delete audio files
os.remove("recording.wav")
os.remove("translation.mp3")
