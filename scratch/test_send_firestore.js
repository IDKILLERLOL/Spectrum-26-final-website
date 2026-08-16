const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  try {
    const snap = await getDoc(doc(db, "systemConfig", "gmail"));
    if (!snap.exists()) {
      console.log("No token in Firestore.");
      return;
    }
    const token = snap.data().token;
    console.log("Using token from Firestore:", token.slice(0, 15) + "...");

    const festName = "SPECTRUM 26";
    const receiver = "i.doshi30@gmail.com";
    const message = [
      `From: ${festName}`,
      `To: ${receiver}`,
      `Subject: Gmail API Test`,
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      "",
      "<p>Testing Gmail API from diagnostic script using Firestore token.</p>",
    ].join("\r\n");

    const encoded = Buffer.from(message, "utf-8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encoded }),
    });

    console.log("Response Status:", res.status);
    const body = await res.json().catch(() => ({}));
    console.log("Response Body:", JSON.stringify(body, null, 2));

  } catch (err) {
    console.error("Test run failed:", err);
  }
}

run().then(() => process.exit(0));
