import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const ROLE_ID = "1438324999684362250";
const FLORIDA_TIMEZONE = "America/New_York";
const TARGET_DATE = "2026-02-01";
const CUSTOM_FOOTER = process.env.CUSTOM_FOOTER || ""; 

if (!WEBHOOK_URL) {
  console.error("Error: WEBHOOK_URL environment variable is missing.");
  process.exit(1);
}

function getDaysUntil() {
  const today = dayjs().tz(FLORIDA_TIMEZONE).startOf("day");
  // parsing the target specifically in the timezone prevents offset errors
  const target = dayjs.tz(TARGET_DATE, FLORIDA_TIMEZONE).startOf("day");
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
      `Manager it is **${days}** days until **Walpurgisnacht**`,
      `**${days}** days remain until **Walpurgisnacht**`,
      `Only **${days}** days left before **Walpurgisnacht** begins`,
      `**${days}** days until the night of Walpurgis`,
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
    // Post-event logic
    const passed = Math.abs(days);
    const options = [
      `It has been ${passed} days since **Walpurgisnacht**. Await the next.`,
      `${passed} days have passed since **Walpurgisnacht**.`,
      `${passed} days beyond the last Walpurgis.`,
    ];
    
    // LOGIC FIX: If you want a separate countdown for Asher, calculate it here
    // Otherwise, ${days} prints a negative number (e.g. "-5")
    content = `# WALPURGIS NIGHT UPDATE\n${pick(options)}${footer}\n(Day ${days} relative to event)`;
  }

  try {
    await axios.post(WEBHOOK_URL, {
      content,
      allowed_mentions: { parse: ["roles"] } // Ensures the role ping works
    });
    console.log("Message sent successfully!");
    console.log("Content:", content);
  } catch (error) {
    console.error("Failed to send webhook:");
    console.error(error.message);
  }
}

sendUpdate();
