const dotenv = require("dotenv");
dotenv.config();

const url = process.env.APPS_SCRIPT_URL || process.env.VITE_GOOGLE_SHEETS_WEBAPP_URL;
console.log("Using Apps Script URL:", url);

async function test() {
  const payload = {
    type: "email",
    to: "i.doshi30@gmail.com",
    subject: "Apps Script Email Test",
    html: "<p>This is a test email sent directly via Apps Script Web App relay.</p>",
    text: "This is a test email sent directly via Apps Script Web App relay.",
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
