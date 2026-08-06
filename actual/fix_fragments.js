import fs from 'fs';
const pages = [
  'AdminEventsPage', 'AdminRegistrationsPage', 'AdminUsersPage', 'AdminWinnersPage', 'AuditLogPage',
  'SchedulePage', 'EventDetailPage', 'RegistrationsPage'
];

for (let p of pages) {
  let file = './src/pages/' + p + '.tsx';
  let c = fs.readFileSync(file, 'utf8');
  
  // They all have `return (\n    <>\n` somewhere.
  // We need to find where the main component ends.
  // It ends before the FIRST `function ` (excluding the main component's own `function ` declaration)
  // OR at the very end of the file if there are no subcomponents.
  
  // The first component is `export function <Name>() { ... return ( ... )`
  
  // Let's find the FIRST `function ` that is NOT `export function`.
  let firstSubFunc = c.indexOf('function ', c.indexOf('export function') + 15);
  
  if (firstSubFunc !== -1) {
    // The main component's return must end right before this subcomponent.
    // It currently has some `  );` or something before it.
    // Let's replace the space before it.
    // Actually, in `AdminUsersPage.tsx`, we have:
    // `    </div>  );}function AdminRow`
    // We should replace `  );}function` with `\n    </>\n  );\n}\nfunction`
    c = c.replace(/  \);\s*\}function/g, '\n    </>\n  );\n}\nfunction');
  } else {
    // There are no subcomponents. The file just ends with `  );}`
    c = c.replace(/  \);\s*\}$/g, '\n    </>\n  );\n}');
  }
  
  fs.writeFileSync(file, c);
}
