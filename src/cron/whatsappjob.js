import cron from "node-cron";
import sendEventReminders from "./sendReminders.js";
import sendCompletionMessages from "./sendCompletions.js";

// Run at 8:00 AM daily – Reminder
cron.schedule("0 11 * * *", async () => {
  console.log("📅 Sending WhatsApp Reminders...");
  await sendEventReminders();
});

// Run at 10:00 PM daily – Completion
cron.schedule("0 22 * * *", async () => {
  console.log("🌙 Sending WhatsApp Completions...");
  await sendCompletionMessages();
});
  