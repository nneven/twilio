import { Router } from "express";
import twilio from "twilio";

import { generateAIResponse } from "../utils/chat.js";

const router = Router();
const { VoiceResponse } = twilio.twiml;

// Define the main function for handling requests
router.post("/respond", async (request, response) => {
  // Set up the Twilio VoiceResponse object to generate the TwiML
  const twiml = new VoiceResponse();

  // Initiate the Twilio Response object to handle updating the cookie with the chat history
  // const response = new Twilio.Response();

  // Parse the cookie value if it exists
  const cookieValue = request.cookies.convo;
  const cookieData = cookieValue
    ? JSON.parse(decodeURIComponent(cookieValue))
    : null;

  // Get the user's voice input from the event
  let voiceInput = request.body.SpeechResult;

  // Create a conversation variable to store the dialog and the user's input to the conversation history
  const conversation = cookieData?.conversation || [];
  conversation.push(`user: ${voiceInput}`);

  // Get the AI's response based on the conversation history
  const aiResponse = await generateAIResponse(conversation.join(";"));

  // For some reason the OpenAI API loves to prepend the name or role in its responses, so let's remove 'assistant:' 'Joanna:', or 'user:' from the AI response if it's the first word
  const cleanedAiResponse = aiResponse.replace(/^\w+:\s*/i, "").trim();

  // Add the AI's response to the conversation history
  conversation.push(`assistant: ${aiResponse}`);

  // Limit the conversation history to the last 10 messages; you can increase this if you want but keeping things short for this demonstration improves performance
  while (conversation.length > 10) {
    conversation.shift();
  }

  // Generate some <Say> TwiML using the cleaned up AI response
  twiml.say(
    {
      voice: "Polly.Joanna-Neural",
    },
    cleanedAiResponse
  );

  // Redirect to the Function where the <Gather> is capturing the caller's speech
  twiml.redirect(
    {
      method: "POST",
    },
    `/transcribe`
  );

  // Since we're using the response object to handle cookies we can't just pass the TwiML straight back to the callback, we need to set the appropriate header and return the TwiML in the body of the response
  response.appendHeader("Content-Type", "application/xml");
  // response.setBody(twiml.toString());

  // Update the conversation history cookie with the response from the OpenAI API
  const newCookieValue = encodeURIComponent(
    JSON.stringify({
      conversation,
    })
  );
  response.cookie("convo", newCookieValue);

  // Return the response to the handler
  response.send(twiml.toString());
});

export default router;
