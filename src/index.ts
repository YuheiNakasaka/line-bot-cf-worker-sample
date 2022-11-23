import {
  Client,
  ClientConfig,
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

  const clientConfig: ClientConfig = {
    channelAccessToken: c.env.CHANNEL_ACCESS_TOKEN || "",
    channelSecret: c.env.CHANNEL_SECRET,
  };
  const client = new Client(clientConfig);
  await Promise.all(
    events.map(async (event: WebhookEvent) => {
      try {
        await textEventHandler(client, event);
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
  client: Client,
  event: WebhookEvent
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
  await client.replyMessage(replyToken, response);
};

export default app;
