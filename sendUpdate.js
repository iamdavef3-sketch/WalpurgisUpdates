import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const WEBHOOK_URL = process.env.WEBHOOK_URL;
const ROLE_ID = "1438324999684362250";
const FLORIDA_TIMEZONE = "America/New_York";
const TARGET_DATE = "2026-02-01"; // Walpurgisnacht
const CUSTOM_FOOTER = process.env.CUSTOM_FOOTER || ""; 

function getDaysUntil() {
  const today = dayjs().tz(FLORIDA_TIMEZONE).startOf("day");
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

  // Logic to handle the "Asher" line safely for both future and past dates
  let asherLine = "";
  if (days > 0) {
    asherLine = `\n${days} days until Asher's hair is back`;
  } else if (days < 0) {
    // If date passed, assume the hair "didn't load" or show days passed
    asherLine = `\n Asher's hair is back`;
  }

  if (days > 0) {
    const options = [
      `Manager it is **${days}** days until **Walpurgisnacht**`,
      `**${days}** days remain until **Walpurgisnacht**`,
      `Only **${days}** days left before **Walpurgisnacht** begins`,
      `**${days}** days until the night of Walpurgis`,
    ];
    // Added asherLine here so it shows up during the countdown
    content = `# WALPURGIS NIGHT UPDATE\n${pick(options)}${footer}${asherLine}`;

  } else if (days === 0) {
    const options = [
      `# Today is WALPURGISNACHT!\n<@&${ROLE_ID}>`,
      `# It is WALPURGISNACHT.\n<@&${ROLE_ID}>`,
    ];
    content = pick(options) + footer + "\nasher's hair is finally back!";

  } else {
    const passed = Math.abs(days);
    const options = [
      `It has been ${passed} days since **Walpurgisnacht**.`,
      `${passed} days have passed since **Walpurgisnacht**.`,
    ];
    content = `# WALPURGIS NIGHT UPDATE\n${pick(options)}${footer}${asherLine}`;
  }

  await axios.post(WEBHOOK_URL, {
    content,
    allowed_mentions: { parse: ["roles"] }
  });

  console.log("Sent:", content);
}

sendUpdate().catch(console.error);
