import { WebhookEvent } from "./types/line";
import { Hono } from "hono";
import { Line } from "./line";
import { OpenAI } from "./openai";
import { Conversation } from "./types/tables";

const app = new Hono();

app.get("*", (c) => c.text("Hello World!"));

app.post("/api/webhook", async (c) => {
  const data = await c.req.json();
  const events: WebhookEvent[] = (data as any).events;

  await Promise.all(
    events.map(async (event: WebhookEvent) => {
      if (event.type !== "message" || event.message.type !== "text") {
        return;
      }
      const { replyToken } = event;
      const { text: my_message } = event.message;

      try {
        // Fetch 2 conversation from D1
        const { results }: { results: Conversation[] } = await c.env.DB.prepare(
          `select * from conversations order by id desc limit 2`
        ).all();
        console.log(results);

        // Generate answer with OpenAI
        const openaiClient = new OpenAI(c.env.OPENAI_API_KEY);
        const generatedMessage = await openaiClient.generateMessage(
          results,
          my_message
        );
        console.log(generatedMessage);
        if (!generatedMessage) throw new Error("No message generated");

        // Save generated answer to D1
        await c.env.DB.prepare(
          `insert into conversations (my_message, bot_message) values (?, ?)`
        )
          .bind(my_message, generatedMessage)
          .run();

        // Reply to the user
        const lineClient = new Line(c.env.CHANNEL_ACCESS_TOKEN);
        return await lineClient.replyMessage(generatedMessage, replyToken);
      } catch (err: unknown) {
        if (err instanceof Error) console.error(err);
        const lineClient = new Line(c.env.CHANNEL_ACCESS_TOKEN);
        return await lineClient.replyMessage(
          "I am not feeling well right now.",
          replyToken
        );
      }
    })
  );
  return c.json({ message: "ok" });
});

export default app;
