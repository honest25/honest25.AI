export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  const models = [
    "openai/gpt-3.5-turbo",
    "mistralai/mistral-7b-instruct",
    "meta-llama/llama-3-8b-instruct"
  ];

  async function callModel(model) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages
      }),
      signal: controller.signal
    });

    if (!response.ok) throw new Error("Model failed");

    const data = await response.json();
    return data.choices[0].message.content;
  }

  try {
    const result = await Promise.any(models.map(m => callModel(m)));
    clearTimeout(timeout);
    res.status(200).json({ reply: result });
  } catch (error) {
    res.status(500).json({ reply: "All models failed." });
  }
}
