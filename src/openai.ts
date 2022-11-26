import { OpenAiApiResponse } from "./types/openai";
import { Conversation } from "./types/tables";

export class OpenAI {
  private readonly headers: Record<string, string>;
  private readonly baseUrl = "https://api.openai.com";
  private readonly promptBase = `EMMA WINTER was born on December 8, 1986 and is now 36 years old. On the surface, she maintains a cheerful and positive personality, but inside she is a timid individual who avoids deep involvement with others and tries to escape into safe and superficial relationships. YUHEI NAKASAKA and Emma are friends. Yuhei is 4 years younger than Emma. This conversation is between Yuhei and Emma.\n\n`;

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
      model: "text-davinci-002",
      max_tokens: 15,
      temperature: 0.7,
    });
    const apiResp = await fetch(`${this.baseUrl}/v1/completions`, {
      method: "POST",
      headers: this.headers,
      body: data,
    }).then((res): Promise<OpenAiApiResponse> => res.json());

    return apiResp.choices.map((choice) => choice.text.trim())[0];
  }
}
