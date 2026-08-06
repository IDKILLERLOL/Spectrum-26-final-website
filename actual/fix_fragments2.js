import fs from 'fs';
const pages = [
  'AdminEventsPage', 'AdminRegistrationsPage', 'AdminUsersPage', 'AdminWinnersPage', 'AuditLogPage',
  'SchedulePage', 'EventDetailPage', 'RegistrationsPage'
];

for (let p of pages) {
  let file = './src/pages/' + p + '.tsx';
  let c = fs.readFileSync(file, 'utf8');
  
  let match = c.indexOf('function ', c.indexOf('export function') + 15);
  if (match !== -1) {
     let before = c.substring(0, match);
     let after = c.substring(match);
     
     // The before string ends with `);}` or something similar.
     // Let's just find the last `)` in the before string and assume it's the end of the return.
     let lastParen = before.lastIndexOf(')');
     let beforeParen = before.substring(0, lastParen);
     
     c = beforeParen + '\n    </>\n  );\n}\n' + after;
  } else {
     let lastParen = c.lastIndexOf(')');
     let beforeParen = c.substring(0, lastParen);
     c = beforeParen + '\n    </>\n  );\n}\n';
  }
  
  fs.writeFileSync(file, c);
}
