const { config } = require("dotenv");
const { resolve } = require("path");
config({ path: resolve(__dirname, "../.env") });

const { cert, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing credentials");
    process.exit(1);
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore();
  
  console.log("Listing all documents in 'events' collection...");
  const snap = await db.collection("events").get();
  console.log("Total docs:", snap.size);
  snap.forEach((doc) => {
    console.log(`Document ID: ${doc.id}`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });
}

main().catch(console.error);
