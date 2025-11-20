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

// --- CONFIGURATION ---
const WALPURGIS_DATE = "2026-02-01"; 
const ASHER_DATE = "2026-04-01"; 
const WALPURGIS_PING_HOUR = 17; // 17:00 Military Time = 5:00 PM

function getDaysUntil(dateString) {
  const today = dayjs().tz(FLORIDA_TIMEZONE).startOf("day");
  const target = dayjs.tz(dateString, FLORIDA_TIMEZONE).startOf("day");
  return target.diff(today, "day");
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sendUpdate() {
  const nowCtx = dayjs().tz(FLORIDA_TIMEZONE);
  const currentHour = nowCtx.hour();
  
  const wDays = getDaysUntil(WALPURGIS_DATE);
  const aDays = getDaysUntil(ASHER_DATE);

  // --- LOGIC: PREVENT DOUBLE POSTING ---
  // If it is afternoon (>= 12:00 PM) AND it is NOT Walpurgis Day, stop here.
  // We only want the afternoon run to actually do something on Day 0.
  if (currentHour >= 12 && wDays !== 0) {
    console.log("Afternoon run on a non-Walpurgis day. Skipping update to avoid double-post.");
    return;
  }

  const footer = CUSTOM_FOOTER ? `\n${CUSTOM_FOOTER}` : "";
  let mainContent = "";
  let asherContent = "";

  // --- 1. WALPURGIS LOGIC ---
  if (wDays > 0) {
    // Regular Countdown (Morning runs only due to check above)
    const options = [
      `Manager it is **${wDays}** days until **Walpurgisnacht**`,
      `**${wDays}** days remain until **Walpurgisnacht**`,
      `Only **${wDays}** days left before **Walpurgisnacht** begins`,
      `**${wDays}** days until the night of Walpurgis`,
    ];
    mainContent = `# WALPURGIS NIGHT UPDATE\n${pick(options)}`;
  } 
  else if (wDays === 0) {
    // IT IS WALPURGIS DAY
    if (currentHour >= WALPURGIS_PING_HOUR) {
        // It is 5:00 PM or later: SEND THE PING
        const options = [
            `# Today is WALPURGISNACHT!\n<@&${ROLE_ID}>`,
            `# It is WALPURGISNACHT.\n<@&${ROLE_ID}>`,
        ];
        mainContent = pick(options);
    } else {
        // It is Morning (6 AM run): Hype up, but NO PING
        mainContent = `# Today is WALPURGISNACHT!\n(The extractions begins at 5:00 PM EST...)`;
    }
  } 
  else {
    // Date Passed (Morning runs only due to check above)
    const passed = Math.abs(wDays);
    const options = [
      `It has been ${passed} days since **Walpurgisnacht**.`,
      `${passed} days have passed since **Walpurgisnacht**.`,
    ];
    mainContent = `# WALPURGIS NIGHT UPDATE\n${pick(options)}`;
  }

  // --- 2. ASHER LOGIC ---
  // This is just appended to the bottom of whatever message sends
  if (aDays > 0) {
    asherContent = `\n${aDays} days until Asher's hair is back`;
  } else if (aDays === 0) {
    asherContent = `\nAsher's hair is back today!`;
  } else {
    asherContent = `\nAsher's hair is back`; 
  }

  // --- COMBINE AND SEND ---
  const finalContent = `${mainContent}${footer}${asherContent}`;

  await axios.post(WEBHOOK_URL, {
    content: finalContent,
    allowed_mentions: { parse: ["roles"] }
  });

  console.log("Sent update.");
  console.log(`Walpurgis: ${wDays} days, Asher: ${aDays} days, Hour: ${currentHour}`);
}

sendUpdate().catch(console.error);
