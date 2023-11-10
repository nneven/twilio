async function createAssistantCompletion(messages) {
  const assistant = await openai.beta.assistants.create({
    name: "Math Tutor",
    instructions:
      "You are a personal math tutor. Write and run code to answer math questions.",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4-1106-preview",
  });
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content:
          "I need to solve the equation `3x + 11 = 14`. Can you help me?",
      },
    ],
  });
  let run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
    instructions:
      "Please address the user as Jane Doe. The user has a premium account.",
  });
  run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  while (run.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    console.log(run.status);
  }
  const thread_messages = await openai.beta.threads.messages.list(thread.id);
  console.log(thread_messages.body.data[0].content[0].text.value);
  return thread_messages.body.data[0].content[0].text.value;
}
