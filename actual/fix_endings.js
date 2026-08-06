import fs from 'fs';
const pages = [
  'AdminEventsPage', 'AdminRegistrationsPage', 'AdminUsersPage', 'AdminWinnersPage', 'AuditLogPage',
  'SchedulePage', 'EventDetailPage', 'RegistrationsPage'
];

for (let p of pages) {
  let file = './src/pages/' + p + '.tsx';
  let c = fs.readFileSync(file, 'utf8');
  
  if (!c.trim().endsWith('}')) {
     c = c.trim() + '\n}\n';
  }
  fs.writeFileSync(file, c);
}
