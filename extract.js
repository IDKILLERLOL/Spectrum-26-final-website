import fs from 'fs';

const pages = [
  'AdminEventsPage', 'AdminRegistrationsPage', 'AdminUsersPage', 'AdminWinnersPage', 'AuditLogPage',
  'SchedulePage', 'EventDetailPage', 'RegistrationsPage'
];

for (let p of pages) {
  let file = './src/pages/' + p + '.tsx';
  let c = fs.readFileSync(file, 'utf8');

  // Let's just fix it by replacing the wrapper opening and closing tags.
  // For Admin pages, opening is:
  // <div className="min-h-screen w-full flex flex-col bg-bg-base text-text-primary overflow-hidden font-sans">      <div className="flex-1 flex overflow-hidden relative">            <aside ... </aside>        <main className="flex-1 flex flex-col relative overflow-y-auto">
  // We can just use a generic replace!
  
  // 1. Remove opening wrappers. 
  // We know it starts right after `return (`.
  let startIdx = c.indexOf('return (');
  if (startIdx !== -1) {
    let mainIdx = c.indexOf('<main ', startIdx);
    if (mainIdx !== -1) {
      let mainEnd = c.indexOf('>', mainIdx);
      
      let replaceContent = c.substring(startIdx + 8, mainEnd + 1);
      c = c.replace(replaceContent, '\n    <>\n');
    }
  }
  
  // 2. Remove closing wrappers.
  // It's `</main>      </div>    </div>` for admin, and `</main> <footer>...</footer> </div>` for non-admin.
  c = c.replace(/<\/main>\s*<\/div>\s*<\/div>/g, '\n    </>\n');
  c = c.replace(/<\/main>[\s\S]*?<footer[\s\S]*?<\/footer>\s*<\/div>/g, '\n    </>\n');
  c = c.replace(/<\/main>\s*<\/div>/g, '\n    </>\n');
  
  fs.writeFileSync(file, c);
}
