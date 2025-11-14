import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const ROLE_ID = "1438324999684362250";
const FLORIDA_TIMEZONE = "America/New_York";

function getDaysUntil() {
  const today = dayjs().tz(FLORIDA_TIMEZONE).startOf("day");
  const target = dayjs("2026-02-01").tz(FLORIDA_TIMEZONE).startOf("day");
  return target.diff(today, "day");
}

async function sendUpdate() {
  const days = getDaysUntil();
  let content;

  if (days > 0) {
    content =
      `# WALPURGIS NIGHT UPDATE\n` +
      `Manager it is ${days} days until **Walpurgisnacht**\n` +
      `||Remember the rule. We do not extract until Walpurgis or we face punishment of the sack.||`;
  } else if (days === 0) {
    content = `# Today is WALPURGISNACHT!\n<@&${ROLE_ID}>`;
  } else {
    content =
      `# WALPURGIS NIGHT UPDATE\n` +
      `It has been ${Math.abs(days)} days since **Walpurgisnacht**. Await the next.`;
  }

  await axios.post(WEBHOOK_URL, {
    content,
    allowed_mentions: { parse: ["roles"] }
  });

  console.log("Sent:", content);
}

sendUpdate().catch(console.error);