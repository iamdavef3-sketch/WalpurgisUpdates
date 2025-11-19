import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const ROLE_ID = "1438324999684362250";
const FLORIDA_TIMEZONE = "America/New_York";
const CUSTOM_FOOTER = process.env.CUSTOM_FOOTER || ""; 
// Example: CUSTOM_FOOTER="||Remember the rule||"

function getDaysUntil() {
  const today = dayjs().tz(FLORIDA_TIMEZONE).startOf("day");
  const target = dayjs("2026-02-01").tz(FLORIDA_TIMEZONE).startOf("day");
  return target.diff(today, "day");
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sendUpdate() {
  const days = getDaysUntil();
  let content;

  const footer = CUSTOM_FOOTER ? `\n${CUSTOM_FOOTER}` : "";

  if (days > 0) {
    const options = [
      `Manager it is ${days} days until **Walpurgisnacht**`,
      `${days} days remain until **Walpurgisnacht**`,
      `Only ${days} days left before **Walpurgisnacht** begins`,
      `${days} days until the night of Walpurgis`,
    ];
    content = `# WALPURGIS NIGHT UPDATE\n${pick(options)}${footer}`;
  } else if (days === 0) {
    const options = [
      `# Today is WALPURGISNACHT!\n<@&${ROLE_ID}>`,
      `# It is WALPURGISNACHT.\n<@&${ROLE_ID}>`,
      `# The walpurgis night has come.\n<@&${ROLE_ID}>`,
    ];
    content = pick(options) + footer;
  } else {
    const passed = Math.abs(days);
    const options = [
      `It has been ${passed} days since **Walpurgisnacht**. Await the next.`,
      `${passed} days have passed since **Walpurgisnacht**.`,
      `${passed} days beyond the last Walpurgis.`,
    ];
    content = `# WALPURGIS NIGHT UPDATE\n${pick(options)}${footer}\n${days} until asher's hair is back
    `;
  }

  await axios.post(WEBHOOK_URL, {
    content,
    allowed_mentions: { parse: ["roles"] }
  });

  console.log("Sent:", content);
}

sendUpdate().catch(console.error);
