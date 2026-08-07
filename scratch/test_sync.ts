import { getOrCreateRegistrationSheet, syncRegistrationsToGoogleSheets } from '../src/lib/workspace';
import { getEvents, getAllRegistrations, getActiveTeamMembers } from '../src/lib/firestore';

async function run() {
  try {
    const sheetId = await getOrCreateRegistrationSheet();
    console.log("Sheet ID:", sheetId);
    
    const allEvents = await getEvents();
    console.log("Events:", allEvents.length);
    
    const regs = await getAllRegistrations();
    console.log("Registrations:", regs.length);
    
    const members = await Promise.all(regs.map(r => getActiveTeamMembers(r.id)));
    const allMembers = members.flat();
    console.log("Members:", allMembers.length);
    
    console.log("Running sync...");
    await syncRegistrationsToGoogleSheets(sheetId, allEvents, regs, allMembers);
    console.log("Done!");
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
