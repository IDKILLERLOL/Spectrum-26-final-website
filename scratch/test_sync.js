const dotenv = require("dotenv");
dotenv.config();

const url = process.env.APPS_SCRIPT_URL || process.env.VITE_GOOGLE_SHEETS_WEBAPP_URL;
console.log("Using URL:", url);

async function test() {
  const payload = {
    type: "registration",
    id: "test-id-" + Date.now(),
    fullName: "Test User",
    email: "test@example.com",
    eventName: "Dual Debug",
    teamSize: 2,
    paymentRefId: "123456789012",
    amountPaid: 150,
    paymentStatus: "PENDING",
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response text:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
