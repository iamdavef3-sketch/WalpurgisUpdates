import axios from "axios";
import dayjs from "dayjs";

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const ROLE_ID = "1438324999684362250";

function getDaysUntil() {
  const today = dayjs().startOf("day");
  const target = dayjs("2026-02-01");
  return target.diff(today, "day");
}

async function sendUpdate() {
  const days = getDaysUntil();
  let content;

  if (days > 0) {
    content = `# WALPURGIS NIGHT UPDATE\nManager it is ${days} days until **Walpurgisnacht**!`;
  } else if (days === 0) {
    content = `# Today is WALPURGISNACHT!\n<@&${ROLE_ID}>`;
  } else {
    content = `# WALPURGIS NIGHT UPDATE\nThe ritual has passed. Await the next Walpurgisnacht.`;
  }

  await axios.post(WEBHOOK_URL, {
    content,
    allowed_mentions: { parse: ["roles"] }
  });

  console.log("Sent:", content);
}

sendUpdate();
