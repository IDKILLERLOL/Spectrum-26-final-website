const fs = require('fs');
let c = fs.readFileSync('./src/pages/AdminUsersPage.tsx', 'utf8');

c = c.replace(/<div className="min-h-screen[\s\S]*?<main className="flex-1 flex flex-col relative overflow-y-auto">/, '');
c = c.replace(/  \);\n\}function AdminRow/, '  );\n}\n\nfunction AdminRow');
c = c.replace(/    <\/tr>\n  \);        <\/main>      <\/div>    <\/div>  \);\}/, '    </tr>\n  );\n}');

fs.writeFileSync('./src/pages/AdminUsersPage.tsx', c);
