const fs = require('fs');
let c = fs.readFileSync('./src/pages/AdminUsersPage.tsx', 'utf8');

c = c.replace(/    <\/tr>\n  \);        <\/main>      <\/div>    <\/div>  \);\}/, '    </tr>\n  );\n}');

fs.writeFileSync('./src/pages/AdminUsersPage.tsx', c);
