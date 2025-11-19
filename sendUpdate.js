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

// --- CONFIGURATION: SEPARATE DATES HERE ---
const WALPURGIS_DATE = "2026-02-01"; 
const ASHER_DATE = "2026-04-01"; // Change this to whatever date Asher's hair is back

// Calculates days until a specific target date string
function getDaysUntil(dateString) {
  const today = dayjs().tz(FLORIDA_TIMEZONE).startOf("day");
  const target = dayjs.tz(dateString, FLORIDA_TIMEZONE).startOf("day");
  return target.diff(today, "day");
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sendUpdate() {
  // Calculate both counters separately
  const wDays = getDaysUntil(WALPURGIS_DATE);
  const aDays = getDaysUntil(ASHER_DATE);

  const footer = CUSTOM_FOOTER ? `\n${CUSTOM_FOOTER}` : "";
  let mainContent = "";
  let asherContent = "";

  // --- 1. WALPURGIS LOGIC ---
  if (wDays > 0) {
    const options = [
      `Manager it is **${wDays}** days until **Walpurgisnacht**`,
      `**${wDays}** days remain until **Walpurgisnacht**`,
      `Only **${wDays}** days left before **Walpurgisnacht** begins`,
      `**${wDays}** days until the night of Walpurgis`,
    ];
    mainContent = `# WALPURGIS NIGHT UPDATE\n${pick(options)}`;
  } else if (wDays === 0) {
    const options = [
      `# Today is WALPURGISNACHT!\n<@&${ROLE_ID}>`,
      `# It is WALPURGISNACHT.\n<@&${ROLE_ID}>`,
    ];
    mainContent = pick(options);
  } else {
    const passed = Math.abs(wDays);
    const options = [
      `It has been ${passed} days since **Walpurgisnacht**.`,
      `${passed} days have passed since **Walpurgisnacht**.`,
    ];
    mainContent = `# WALPURGIS NIGHT UPDATE\n${pick(options)}`;
  }

  // --- 2. ASHER LOGIC (Independent) ---
  if (aDays > 0) {
    asherContent = `\n${aDays} days until Asher's hair is back`;
  } else if (aDays === 0) {
    asherContent = `\nAsher's hair is back today!`;
  } else {
    // Negative days (Date passed)
    asherContent = `\nAsher's hair is back`; 
  }

  // --- COMBINE AND SEND ---
  const finalContent = `${mainContent}${footer}${asherContent}`;

  await axios.post(WEBHOOK_URL, {
    content: finalContent,
    allowed_mentions: { parse: ["roles"] }
  });

  console.log("Sent update.");
  console.log(`Walpurgis: ${wDays}, Asher: ${aDays}`);
}

sendUpdate().catch(console.error);
