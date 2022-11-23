import {
  MessageAPIResponseBase,
  TextMessage,
  WebhookEvent,
} from "@line/bot-sdk";
import { Hono } from "hono";

const app = new Hono();
app.get("*", (c) => c.text("Hello World!"));

app.post("/api/webhook", async (c) => {
  const data = await c.req.json();
  const events: WebhookEvent[] = (data as any).events;
  const accessToken: string = c.env.CHANNEL_ACCESS_TOKEN;

  await Promise.all(
    events.map(async (event: WebhookEvent) => {
      try {
        await textEventHandler(event, accessToken);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error(err);
        }
        return c.json({
          status: "error",
        });
      }
    })
  );
  return c.json({ message: "ok" });
});

const textEventHandler = async (
  event: WebhookEvent,
  accessToken: string
): Promise<MessageAPIResponseBase | undefined> => {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }

  const { replyToken } = event;
  const { text } = event.message;
  const response: TextMessage = {
    type: "text",
    text,
  };
  await fetch("https://api.line.me/v2/bot/message/reply", {
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [response],
    }),
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
};

export default app;
