import OpenAI from "openai";

import { getTimeSlots } from "./calendly.js";

// Set up the OpenAI API with the API key
const openai = new OpenAI();

// Function to generate the AI response based on the conversation history
export async function generateAIResponse(conversation) {
  const messages = await formatConversation(conversation);
  return await createChatCompletion(messages);
  // return await agent(messages[messages.length - 1].content);
}

// Function to create a chat completion using the OpenAI API
async function createChatCompletion(messages) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: messages,
      temperature: 0.1, // Controls the randomness of the generated responses. Higher values (e.g., 1.0) make the output more random and creative, while lower values (e.g., 0.2) make it more focused and deterministic.
      max_tokens: 420, // You can adjust this number to control the length of the generated responses. Keep in mind that setting max_tokens too low might result in responses that are cut off and don't make sense.
      // top_p: 0.9, Set the top_p value to around 0.9 to keep the generated responses focused on the most probable tokens without completely eliminating creativity. Adjust the value based on the desired level of exploration.
      // n: 1, Specifies the number of completions you want the model to generate. Generating multiple completions will increase the time it takes to receive the responses.
    });
    // Check if the response has a status code of 500
    if (completion.status === 500) {
      console.error("Error: OpenAI API returned a 500 status code."); // Log an error message indicating that the OpenAI API returned a 500 status code
      twiml.say(
        {
          // Create a TwiML say element to provide an error message to the user
          voice: "Polly.Joanna-Neural",
        },
        "Oops, looks like I got an error from the OpenAI API on that request. Let's try that again."
      );
      twiml.redirect(
        {
          // Create a TwiML redirect element to redirect the user to the /transcribe endpoint
          method: "POST",
        },
        `/transcribe`
      );
      response.appendHeader("Content-Type", "application/xml"); // Set the Content-Type header of the response to "application/xml"
      response.send(twiml.toString()); // Set the body of the response to the XML string representation of the TwiML response
      // return callback(null, response); // Return the response to the callback function
    }
    return completion.choices[0].message.content;
  } catch (error) {
    // Check if the error is a timeout error
    if (error.code === "ETIMEDOUT" || error.code === "ESOCKETTIMEDOUT") {
      console.error("Error: OpenAI API request timed out."); // Log an error message indicating that the OpenAI API request timed out
      twiml.say(
        {
          // Create a TwiML say element to provide an error message to the user
          voice: "Polly.Joanna-Neural",
        },
        "I'm sorry, but it's taking me a little bit too long to respond. Let's try that again, one more time."
      );
      twiml.redirect(
        {
          // Create a TwiML redirect element to redirect the user to the /transcribe endpoint
          method: "POST",
        },
        `/transcribe`
      );
      response.appendHeader("Content-Type", "application/xml"); // Set the Content-Type header of the response to "application/xml"
      response.send(twiml.toString()); // Set the body of the response to the XML string representation of the TwiML response
      // return callback(null, response); // Return the response to the callback function
    } else {
      console.error("Error during OpenAI API request:", error);
      throw error;
    }
  }
}

// Function to format the conversation history into a format that the OpenAI API can understand
async function formatConversation(conversation) {
  const todaysDate = new Date().toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const availableTimes = JSON.stringify(await getTimeSlots());
  const messages = [
    {
      role: "system",
      content: `You are Joanna, an expert in calendar management and scheduling appointments.
                Your goal is to assist users in finding suitable times and provide alternatives if conflicts arise.
                You are having a conversation over the telephone so provide concise but helpful responses.
                When providing available times, provide ranges instead of listing individual slots.
                To schedule an appointment, you must get the user's name and email address. Ask the user to spell it out to avoid errors.
                Today's date is ${todaysDate}. The available time slots are as follows:\n${availableTimes}`,
    },
  ];

  // Iterate through the conversation history and alternate between 'assistant' and 'user' roles
  let isAI = false;
  for (const message of conversation.split(";")) {
    const role = isAI ? "assistant" : "user";
    messages.push({
      role: role,
      content: message,
    });
    isAI = !isAI;
  }
  console.log(messages);
  return messages;
}
