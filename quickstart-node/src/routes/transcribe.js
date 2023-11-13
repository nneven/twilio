import { Router } from "express";
import twilio from "twilio";

const router = Router();
const { VoiceResponse } = twilio.twiml;

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
      "Hey! I'm Joanna, how can I assist you today?"
    );
  }

  // Listen to the user's speech and pass the input to the /respond Function
  twiml.gather({
    action: "/respond", // Send the collected input to /respond
    input: "speech", // Specify speech as the input type
    speechTimeout: "auto", // Automatically determine the end of user speech
    speechModel: "experimental_conversations", // Use the conversation-based speech recognition model
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

export default router;
