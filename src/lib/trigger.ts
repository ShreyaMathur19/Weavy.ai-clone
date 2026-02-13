import { TriggerClient } from "@trigger.dev/sdk";

export const trigger = new TriggerClient({
  id: "workflow-builder",
  apiKey: process.env.TRIGGER_API_KEY!,
});