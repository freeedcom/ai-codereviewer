import * as core from "@actions/core";
import OpenAI from "openai";

const OPENAI_API_KEY: string = core.getInput("OPENAI_API_KEY");
const OPENAI_API_MODEL: string = core.getInput("OPENAI_API_MODEL");
const openai = new OpenAI({
                            apiKey: OPENAI_API_KEY,
                          });

export async function getAIResponse(prompt: string): Promise<Array<{
  lineNumber: string;
  reviewComment: string;
}> | null> {
  const queryConfig = {
    model: OPENAI_API_MODEL,
    temperature: 0.2,
    max_tokens: 700,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  const response =
    await openai.chat.completions.create(
      {
        ...queryConfig,
        // return JSON if the model supports it:
        ...(OPENAI_API_MODEL === "gpt-4-1106-preview"
          ? {response_format: {type: "json_object"}}
          : {}),
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
      });

  const res = response.choices[0].message?.content?.trim() || "{}";
  console.log("GPT response:")
  console.log(res);

  const cleanupResponse = res
    .replace(/```json/g, "")
    .replace(/```/g, "");

  return JSON.parse(cleanupResponse).reviews;
}
