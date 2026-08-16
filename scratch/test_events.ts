import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(__dirname, "../.env") })

import { getEvents } from "../lib/server/firestore-events"

async function main() {
  console.log("Fetching getEvents()...")
  const list = await getEvents()
  console.log("Total events returned:", list.length)
  list.forEach((ev, i) => {
    console.log(`[${i}] ID: ${ev.id} | Name: ${ev.name} | Order: ${ev.order}`)
  })
}

main().catch(console.error)
