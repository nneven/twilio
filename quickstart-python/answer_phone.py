# import os
import json
import openai
import requests
from flask import Flask, request, make_response
from twilio.twiml.voice_response import VoiceResponse

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/answer", methods=['GET', 'POST'])
def answer_call():
    """Respond to incoming phone calls with a brief message."""
    # Start our TwiML response
    resp = VoiceResponse()

    # Read a message aloud to the caller
    resp.say("Thank you for calling! Have a great day.", voice='Polly.Amy')

    return str(resp)

@app.route("/transcribe", methods=['GET', 'POST'])
def transcribe():
    # Create a TwiML Voice Response object to build the response
    resp = VoiceResponse()

    # Check for conversation cookie in the request
    convo_cookie = request.cookies.get('convo')

    # If no previous conversation is present, or if the conversation is empty, start the conversation
    if not convo_cookie:
        # Greet the user with a message
        resp.say("Hey! I'm Joanna, a chatbot created using Twilio and ChatGPT. What would you like to talk about today?",
                 voice='Polly.Joanna-Neural')

    # Listen to the user's speech and pass the input to the /respond endpoint
    resp.gather(input='speech',
                speech_timeout='auto',
                action='/respond',
                method='POST')

    # Convert the TwiML to a string
    twiml_response = str(resp)

    # Create a response object to add headers and cookies
    response = make_response(twiml_response)
    response.headers['Content-Type'] = 'application/xml'

    # If no conversation cookie is present, set an empty conversation cookie
    if not convo_cookie:
        response.set_cookie('convo', '', path='/')

    return response

@app.route("/respond", methods=['POST'])
def respond():
    # Twilio VoiceResponse object to generate the TwiML
    resp = VoiceResponse()

    # Get the user's voice input from the request
    voice_input = request.values.get('SpeechResult', '')

    # Parse the cookie value if it exists
    convo_cookie = request.cookies.get('convo', '[]')
    conversation = json.loads(convo_cookie)
    
    # Append user's input to the conversation history
    conversation.append(f"user: {voice_input}")

    # Get the AI's response based on the conversation history
    ai_response = generate_ai_response(conversation)

    # Clean up the AI's response and remove certain prefixes if present
    cleaned_ai_response = ai_response.replace("assistant:", "").strip()

    # Add the AI's response to the conversation history
    conversation.append(f"assistant: {cleaned_ai_response}")

    # Limit the conversation history to the last 10 messages
    conversation = conversation[-10:]

    # Use <Say> to read out the AI's response
    resp.say(cleaned_ai_response, voice="Polly.Joanna-Neural")

    # Redirect to the Function where the <Gather> is capturing the caller's speech
    resp.redirect(url='/transcribe')

    # Convert the TwiML to a string
    twiml_response = str(resp)

    # Create a Flask response object
    response = make_response(twiml_response)
    response.headers['Content-Type'] = 'application/xml'

    # Update the conversation cookie
    response.set_cookie('convo', json.dumps(conversation), path='/')

    return response

def generate_ai_response(conversation):
    # Format conversation for OpenAI
    messages = format_conversation(conversation)
    try:
        # Create a chat completion using the OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.8,
            max_tokens=100
        )
        return response.choices[0].message.content
    except requests.exceptions.RequestException as e:
        print(f"Error with OpenAI API: {e}")
        return "I'm sorry, I'm having trouble thinking right now."

def format_conversation(conversation):
    # Convert the conversation history into the format expected by OpenAI API
    messages = [{
        'role': 'system',
        'content': 'You are a creative, friendly, and amusing AI assistant named Joanna.',
    }]
    for line in conversation:
        if line.startswith("user: "):
            role = "user"
        else:
            role = "assistant"
        messages.append({'role': role, 'content': line.split(": ", 1)[1]})
    return messages

if __name__ == "__main__":
    app.run(port=8000, debug=True)
