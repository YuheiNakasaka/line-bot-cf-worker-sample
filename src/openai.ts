import { OpenAiApiResponse } from "./types/openai";
import { Conversation } from "./types/tables";

export class OpenAI {
  private readonly headers: Record<string, string>;
  private readonly baseUrl = "https://api.openai.com";
  private readonly promptBase = `EMMA WINTER was born on December 8, 1986 and is now 36 years old. She is a cheerful and positive personality. YUHEI NAKASAKA and Emma are friends. Yuhei is 4 years younger than Emma. This conversation is between Yuhei and Emma.\n\n`;

  constructor(apiKey: string) {
    this.headers = {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    };
  }

  public async generateMessage(
    records: Conversation[],
    message: string
  ): Promise<string | undefined> {
    const dialog = records.reverse().map((record) => {
      return `Yuhei: ${record.my_message}\nEmma: ${record.bot_message}\n`;
    });
    dialog.push(`Yuhei: ${message}\nEmma:`);
    const prompt = `${this.promptBase}${dialog.join("")}`;
    const data = JSON.stringify({
      prompt,
      model: "text-ada-001",
      max_tokens: 15,
      temperature: 0.9,
      stop: "\n",
    });
    const apiResp = await fetch(`${this.baseUrl}/v1/completions`, {
      method: "POST",
      headers: this.headers,
      body: data,
    })
      .then((res): Promise<OpenAiApiResponse> => res.json())
      .catch((err) => {
        console.log(`OpenAI API error: ${err}`);
        return null;
      });
    console.log(`apiResp: ${JSON.stringify(apiResp)}`);
    if (!apiResp) return "";

    return apiResp.choices.map((choice) => choice.text.trim())[0];
  }
}
