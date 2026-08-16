const dotenv = require("dotenv");
dotenv.config();

const { listRegistrations } = require("../lib/server/firestore-registrations");
const { syncToSheet, buildRegistrationRow } = require("../lib/google/apps-script");

async function test() {
  console.log("Fetching registrations from Firestore...");
  const registrations = await listRegistrations();
  console.log(`Found ${registrations.length} registrations.`);

  if (registrations.length === 0) {
    console.log("No registrations found to sync.");
    return;
  }

  const reg = registrations[0];
  console.log("Attempting to sync registration:", reg.id, reg.eventName);

  const payload = buildRegistrationRow({
    type: "registration",
    id: reg.id,
    fullName: reg.fullName,
    email: reg.userEmail,
    eventName: reg.eventName,
    teamSize: reg.teamSize,
    paymentRefId: reg.paymentRefId,
    amountPaid: reg.amountPaid,
    paymentStatus: reg.paymentStatus,
    createdAt: typeof reg.createdAt === "string" ? reg.createdAt : reg.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    teamName: reg.teamName || "",
  });

  console.log("Payload:", JSON.stringify(payload, null, 2));

  console.log("Calling syncToSheet...");
  const ok = await syncToSheet(payload);
  console.log("syncToSheet result:", ok);
}

test().catch(err => console.error("Error:", err));
