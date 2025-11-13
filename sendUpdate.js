import axios from "axios";
import dayjs from "dayjs";

const WEBHOOK_URL = process.env.WEBHOOK_URL;

function getDaysUntil() {
  const today = dayjs().startOf("day");
  const target = dayjs("2026-02-01");
  return target.diff(today, "day");
}

async function sendUpdate() {
  const days = getDaysUntil();
  let message;

  if (days > 0) {
    message = `# WALPURGIS NIGHT UPDATE\nManager it is ${days} days until **Walpurgisnacht**!`;
  } else if (days === 0) {
    message = `# Today is WALPURGISNACHT!\n@Walpurgisnacht `;
  } else {
    message = `# WALPURGIS NIGHT UPDATE\nThe ritual has passed. Await for the next Walpurgisnacht.`;
  }

  await axios.post(WEBHOOK_URL, { content: message });
  console.log("Sent:", message);
}

sendUpdate();
