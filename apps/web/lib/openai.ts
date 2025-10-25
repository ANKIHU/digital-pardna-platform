import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateAIResponse = async (prompt: string, context?: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are Keisha, a helpful Jamaican AI assistant for PardnaLink, a fintech platform for traditional pardna (rotating savings) circles. You speak authentic Jamaican Patois and help users with payments, circles, and financial questions. Be friendly, culturally authentic, and helpful. ${context || ''}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "Mi sorry, mi couldn't understand dat. Can yuh try again?";
  } catch (error) {
    console.error('OpenAI API error:', error);
    return "Mi having some technical difficulties right now. Please try again later or contact support.";
  }
};

export const analyzeDispute = async (disputeDescription: string, disputeType: string) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI mediator for financial disputes in Jamaican pardna circles. Analyze the dispute and provide fair, practical resolution suggestions based on traditional pardna practices and financial best practices."
        },
        {
          role: "user",
          content: `Dispute Type: ${disputeType}\nDescription: ${disputeDescription}\n\nPlease provide a brief analysis and resolution suggestion.`
        }
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content || "Unable to analyze dispute at this time.";
  } catch (error) {
    console.error('OpenAI dispute analysis error:', error);
    return "Dispute analysis temporarily unavailable. Please review manually.";
  }
};

export default openai;