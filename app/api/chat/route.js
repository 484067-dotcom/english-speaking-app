export async function POST(req) {
  try {
    const { topic, messages, studentAnswer } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY is not set." },
        { status: 500 }
      );
    }

    const conversationText = messages
      .map((m) => `${m.role}: ${m.text}`)
      .join("\n");

    const prompt = `
You are a friendly English conversation partner for Japanese high school students.

The topic is: ${topic}

The student has just answered:
"${studentAnswer}"

Conversation so far:
${conversationText}

Your job:
1. Give a short positive reaction.
2. Give one better expression beginning exactly with:
   You can also say, "..."
3. Ask one simple follow-up question.

Rules:
- Use easy English.
- Keep your response short.
- Do not use difficult words.
- Do not explain grammar in detail.
- Do not use Japanese.
- Do not correct too much.
- Make the conversation natural.
- The follow-up question must match the student's answer.
- Total length: within 50 words.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(errorText);
      return Response.json(
        { error: "OpenAI API request failed." },
        { status: 500 }
      );
    }

    const data = await response.json();

    const reply =
      data.output_text ||
      "Good. You can also say, \"I want to say more about it.\" Can you tell me more?";

    return Response.json({ reply });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
