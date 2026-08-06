import fs from 'fs';

const pages = [
  'AdminEventsPage', 'AdminRegistrationsPage', 'AdminUsersPage', 'AdminWinnersPage', 'AuditLogPage',
  'SchedulePage', 'EventDetailPage', 'RegistrationsPage'
];

for (let p of pages) {
  let file = './src/pages/' + p + '.tsx';
  let c = fs.readFileSync(file, 'utf8');

  // Strip trailing garbage
  c = c.replace(/<\/main>\s*<\/div>\s*<\/div>\s*\);\s*\}/, '');
  c = c.replace(/<\/main>\s*<footer[\s\S]*?<\/footer>\s*<\/div>\s*\);\s*\}/, '');

  // Fix component closing
  c = c.replace(/  \);\}/g, '  );\n}\n');

  // Strip starting wrapper for admin
  c = c.replace(/<div className="min-h-screen[^>]*>\s*<div className="flex-1[^>]*>\s*(?:import[\s\S]*?lucide-react';\s*)?<aside[\s\S]*?<\/aside>\s*<main[^>]*>/, '');

  // Strip starting wrapper for non-admin
  c = c.replace(/<div className="min-h-screen[^>]*>\s*<main[^>]*>/, '');

  fs.writeFileSync(file, c);
}
