import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

// --- CONFIGURATION ---
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const ROLE_ID = "1438324999684362250";
const FLORIDA_TIMEZONE = "America/New_York";
const TARGET_DATE = "2026-02-01"; // Walpurgisnacht
const CUSTOM_FOOTER = process.env.CUSTOM_FOOTER || ""; 

// Optional: Set a separate date for Asher's hair if it's different from Walpurgis
const ASHER_HAIR_DATE = "2026-03-01"; // Example date

if (!WEBHOOK_URL) {
  console.error("Error: WEBHOOK_URL is missing.");
  process.exit(1);
}

function getDaysUntil(targetDateStr) {
  const today = dayjs().tz(FLORIDA_TIMEZONE).startOf("day");
  const target = dayjs.tz(targetDateStr, FLORIDA_TIMEZONE).startOf("day");
  return target.diff(today, "day");
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sendUpdate() {
  const days = getDaysUntil(TARGET_DATE);
  let content;

  const footer = CUSTOM_FOOTER ? `\n${CUSTOM_FOOTER}` : "";

  if (days > 0) {
    // COUNTDOWN ACTIVE
    const options = [
      `Manager it is **${days}** days until **Walpurgisnacht**`,
      `**${days}** days remain until **Walpurgisnacht**`,
      `Only **${days}** days left before **Walpurgisnacht** begins`,
      `**${days}** days until the night of Walpurgis`,
    ];
    content = `# WALPURGIS NIGHT UPDATE\n${pick(options)}${footer}`;
    
  } else if (days === 0) {
    // EVENT DAY
    const options = [
      `# Today is WALPURGISNACHT!\n<@&${ROLE_ID}>`,
      `# It is WALPURGISNACHT.\n<@&${ROLE_ID}>`,
      `# The walpurgis night has come.\n<@&${ROLE_ID}>`,
    ];
    content = pick(options) + footer;
    
  } else {
    // POST-EVENT
    const passed = Math.abs(days);
    const options = [
      `It has been ${passed} days since **Walpurgisnacht**. Await the next.`,
      `${passed} days have passed since **Walpurgisnacht**.`,
    ];
    
    // Fix for Asher's countdown:
    // If you want to count DOWN to Asher's hair returning, we need a future date.
    // If we just use ${days} here, it will print a negative number (e.g. "-5").
    // I added a calculation below that counts down to the ASHER_HAIR_DATE defined at the top.
    
    const asherDays = getDaysUntil(ASHER_HAIR_DATE);
    const asherMsg = asherDays > 0 
      ? `${asherDays} days until asher's hair is back` 
      : `Asher's hair should be back by now`;

    content = `# WALPURGIS NIGHT UPDATE\n${pick(options)}${footer}\n${asherMsg}`;
  }

  try {
    await axios.post(WEBHOOK_URL, {
      content,
      allowed_mentions: { parse: ["roles"] }
    });
    console.log(`Sent countdown: ${days} days remaining.`);
  } catch (err) {
    console.error("Failed to send webhook:", err.message);
  }
}

sendUpdate();
