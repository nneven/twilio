const express = require("express");
const router = express.Router();
const VoiceResponse = require("twilio").twiml.VoiceResponse;

router.post("/transcribe", (request, response) => {
  // Create a TwiML Voice Response object to build the response
  const twiml = new VoiceResponse();

  // If no previous conversation is present, or if the conversation is empty, start the conversation
  if (!request.cookies.convo) {
    // Greet the user with a message using AWS Polly Neural voice
    twiml.say(
      {
        voice: "Polly.Joanna-Neural",
      },
      "Hey! I'm Joanna, a chatbot created using Twilio and ChatGPT. What would you like to talk about today?"
    );
  }

  // Listen to the user's speech and pass the input to the /respond Function
  twiml.gather({
    speechTimeout: "auto", // Automatically determine the end of user speech
    speechModel: "experimental_conversations", // Use the conversation-based speech recognition model
    input: "speech", // Specify speech as the input type
    action: "/respond", // Send the collected input to /respond
  });

  // Create a Twilio Response object
  // const response = new Twilio.Response();

  // Set the response content type to XML (TwiML)
  response.appendHeader("Content-Type", "application/xml");

  // Set the response body to the generated TwiML
  // response.setBody(twiml.toString());

  // If no conversation cookie is present, set an empty conversation cookie
  if (!request.cookies.convo) {
    response.cookie("convo", "");
  }

  // Return the response to Twilio
  response.send(twiml.toString());
});

module.exports = router;
