import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(__dirname, "../.env") })

import { cert, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing credentials")
    process.exit(1)
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  const db = getFirestore()
  
  console.log("Deleting event 'code-clash' from Firestore...")
  await db.collection("events").doc("code-clash").delete()
  console.log("Event deleted successfully.")
}

main().catch(console.error)
