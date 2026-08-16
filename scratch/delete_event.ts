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
  
  const idsToDelete = ["tech-duo-1", "tech-solo-1", "non-tech-1", "non-tech-3"]
  for (const id of idsToDelete) {
    console.log(`Deleting old event doc '${id}' from Firestore...`)
    await db.collection("events").doc(id).delete()
  }
  console.log("All duplicate events deleted successfully.")
}

main().catch(console.error)
