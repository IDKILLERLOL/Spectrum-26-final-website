import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

const configPath = join(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app);

const newEvents = [
  {
    id: "tech-duo-1",
    name: "Dual Debug",
    category: "TECH",
    description: "The ultimate duo coding face-off. Show off your team debugging and board game strategy in Codopoly, Swap Challenge, and Snakes & Ladders.",
    isTeamEvent: true,
    maxTeams: null,
    currentTeamCount: 0,
    registrationOpen: true,
    price: 150,
    rulesUrl: null,
    minMembers: 2,
    maxMembers: 2
  },
  {
    id: "tech-solo-1",
    name: "Singularity Strike",
    category: "TECH",
    description: "The ultimate solo arena battle. Conquer the grid, survive the buzzer, and rank in the MCQ challenges.",
    isTeamEvent: false,
    maxTeams: null,
    currentTeamCount: 0,
    registrationOpen: true,
    price: 50,
    rulesUrl: null,
    minMembers: 1,
    maxMembers: 1
  },
  {
    id: "non-tech-1",
    name: "BGMI",
    category: "NON_TECH",
    description: "Squad up. Drop in. Survive. Tactical coordination and raw aiming skill in the ultimate arena.",
    isTeamEvent: true,
    maxTeams: 50,
    currentTeamCount: 0,
    registrationOpen: true,
    price: 800,
    rulesUrl: null,
    minMembers: 4,
    maxMembers: 5
  },
  {
    id: "non-tech-3",
    name: "FC 26",
    category: "NON_TECH",
    description: "The ultimate digital pitch. Bring your tactical formations and flawless execution to the tournament.",
    isTeamEvent: false,
    maxTeams: null,
    currentTeamCount: 0,
    registrationOpen: true,
    price: 100,
    rulesUrl: null,
    minMembers: 1,
    maxMembers: 1
  }
];

async function sync() {
  console.log("Fetching existing events...");
  const snap = await getDocs(collection(db, "events"));
  const keepIds = newEvents.map(e => e.id);

  for (const docSnap of snap.docs) {
    if (!keepIds.includes(docSnap.id)) {
      console.log(`Deleting old event ${docSnap.id} ("${docSnap.data().name}")...`);
      await deleteDoc(doc(db, "events", docSnap.id));
    }
  }

  for (const event of newEvents) {
    console.log(`Upserting event ${event.id} ("${event.name}")...`);
    await setDoc(doc(db, "events", event.id), {
      name: event.name,
      category: event.category,
      description: event.description,
      isTeamEvent: event.isTeamEvent,
      maxTeams: event.maxTeams,
      currentTeamCount: event.currentTeamCount,
      registrationOpen: event.registrationOpen,
      price: event.price,
      rulesUrl: event.rulesUrl,
      minMembers: event.minMembers,
      maxMembers: event.maxMembers
    });
  }

  console.log("Event synchronization finished successfully!");
  process.exit(0);
}

sync().catch(err => {
  console.error(err);
  process.exit(1);
});
