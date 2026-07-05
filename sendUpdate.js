
// Usage: node index.js

import "dotenv/config"; // Loads .env file automatically
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
const WALPURGIS_DATE = "2026-07-9";
const WALPURGIS_PING_HOUR = 17; // 17:00 Military Time = 5:00 PM

// Date Asher became bald (Set to today: Jan 7, 2026)
const ASHER_BALD_DATE = "2026-03-31"; 

// Set this to true to force a message even if it's the afternoon (FOR TESTING ONLY)
const FORCE_SEND = true; 

function getDaysUntil(dateString) {
  const today = dayjs().tz(FLORIDA_TIMEZONE).startOf("day");
  const target = dayjs.tz(dateString, FLORIDA_TIMEZONE).startOf("day");
  // Returns difference in days (negative if passed)
  return target.diff(today, "day");
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sendUpdate() {
  if (!WEBHOOK_URL) {
    console.error("❌ ERROR: WEBHOOK_URL is missing. Check your .env file.");
    return;
  }

  const nowCtx = dayjs().tz(FLORIDA_TIMEZONE);
  const currentHour = nowCtx.hour();
  const wDays = getDaysUntil(WALPURGIS_DATE);

  console.log(`--- DEBUG INFO ---`);
  console.log(`Current Time (FL): ${nowCtx.format("YYYY-MM-DD HH:mm:ss")}`);
  console.log(`Days until Walpurgis: ${wDays}`);
  console.log(`Current Hour: ${currentHour}`);
  console.log(`------------------`);

  // --- LOGIC: PREVENT DOUBLE POSTING ---
  // If it is afternoon (>= 12:00 PM) AND it is NOT Walpurgis Day
  if (currentHour >= 12 && wDays !== 0) {
    if (FORCE_SEND) {
      console.log("⚠️ FORCE_SEND is enabled. Ignoring time check...");
    } else {
      console.log("🚫 Afternoon run on a non-Walpurgis day. Skipping update.");
      return;
    }
  }

  const footer = CUSTOM_FOOTER ? `\n${CUSTOM_FOOTER}` : "";
  let mainContent = "";

  // --- WALPURGIS LOGIC ---
  if (wDays > 0) {
    const options = [
      `It is currently **${wDays}** days until **Walpurgisnacht**`,
      `**${wDays}** days remain until **Walpurgisnacht**`,
      `Only **${wDays}** days left before **Walpurgisnacht** begins`,
      `**${wDays}** days until the night of Walpurgis`,
    ];
    mainContent = `# Faust's updates\n${pick(options)}`;
  } 
  else if (wDays === 0) {
    // IT IS WALPURGIS DAY
    if (currentHour >= WALPURGIS_PING_HOUR) {
        const options = [
            `# Today is WALPURGISNACHT!\n<@&${ROLE_ID}>`,
            `# It is WALPURGISNACHT.\n<@&${ROLE_ID}>`,
        ];
        mainContent = pick(options);
    } else {
        mainContent = `# Today is WALPURGISNACHT!\n(The extraction begins at 5:00 PM EST...)`;
    }
  } 
  else {
    // Date Passed
    const passed = Math.abs(wDays);
    const options = [
      `It has been ${passed} days since **Walpurgisnacht**.`,
      `${passed} days have passed since **Walpurgisnacht**.`,
    ];
    mainContent = `# WALPURGIS NIGHT UPDATE\n${pick(options)}`;
  }

  // --- ASHER BALD LOGIC ---
  // Calculate days passed since the start date
  const todayStart = nowCtx.startOf("day");
  const baldStart = dayjs.tz(ASHER_BALD_DATE, FLORIDA_TIMEZONE).startOf("day");
  const daysBald = todayStart.diff(baldStart, "day");

  // Add the line to the content
  mainContent += `\nIt has been **${daysBald}** days since Asher has been bald.`;

  // --- COMBINE AND SEND ---
  const finalContent = `${mainContent}${footer}`;

  try {
    await axios.post(WEBHOOK_URL, {
      content: finalContent,
      allowed_mentions: { parse: ["roles"] }
    });
    console.log("✅ Sent update successfully.");
  } catch (error) {
    console.error("❌ Failed to send webhook:", error.message);
    if (error.response) {
        console.error("Discord Error Data:", error.response.data);
    }
  }
}

sendUpdate().catch(console.error);
