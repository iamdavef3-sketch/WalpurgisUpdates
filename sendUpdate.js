import axios from "axios";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone"; // Time zone support
import utc from "dayjs/plugin/utc"; // UTC plugin for consistency

// Extend dayjs with timezone and UTC plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const ROLE_ID = "1438324999684362250";

// Define Florida EST timezone
const FLORIDA_TIMEZONE = "America/New_York";

function getDaysUntil() {
  const today = dayjs().tz(FLORIDA_TIMEZONE).startOf("day"); // Today's date at midnight in Florida time
  const target = dayjs.tz("2026-02-01", FLORIDA_TIMEZONE).startOf("day"); // February 1, 2026, at midnight in Florida time
  return target.diff(today, "day"); // Calculate the difference in days
}

async function sendUpdate() {
  const days = getDaysUntil();
  let content;

  if (days > 0) {
    content = `# WALPURGIS NIGHT UPDATE\nManager it is ${days} days until **Walpurgisnacht**!`;
  } else if (days === 0) {
    content = `# Today is WALPURGISNACHT!\n<@&${ROLE_ID}>`;
  } else {
    const pastDays = Math.abs(days);
    content = `# WALPURGIS NIGHT UPDATE\nIt has been ${pastDays} days **since Walpurgisnacht**. Await the next ritual.`;
  }

  await axios.post(WEBHOOK_URL, {
    content,
    allowed_mentions: { parse: ["roles"] },
  });

  console.log("Sent:", content);
}

// Call the function to send the update
sendUpdate();