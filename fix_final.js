import fs from 'fs';
const pages = [
  'AdminEventsPage', 'AdminRegistrationsPage', 'AdminUsersPage', 'AdminWinnersPage', 'AuditLogPage',
  'SchedulePage', 'EventDetailPage', 'RegistrationsPage'
];

for (let p of pages) {
  let file = './src/pages/' + p + '.tsx';
  let c = fs.readFileSync(file, 'utf8');
  
  // Fix the multiple `<>` problem
  c = c.replace(/return \(\s*<>\s*<>/g, 'return (<>');
  c = c.replace(/return \(\s*<>\s*<tr/g, 'return (<tr');
  c = c.replace(/return \(\s*<>\s*<div className="flex gap-2/g, 'return (<div className="flex gap-2');
  c = c.replace(/return \(\s*<>\s*<svg/g, 'return (<svg');
  c = c.replace(/return \(\s*<>\s*<div className="border-b/g, 'return (<div className="border-b');
  
  // Ensure the main component has a closing `</>` right before `);}`
  // Let's just manually insert it right before the FIRST `function ` (or at end of file)
  // Actually we did that already!
  // Let's just fix any unclosed `<>` manually by finding all `<>` and `</>`
  
  let openCount = (c.match(/<>/g) || []).length;
  let closeCount = (c.match(/<\/>/g) || []).length;
  
  if (openCount > closeCount) {
    // missing closing tag! Let's insert it right before `);\n}` of the MAIN component!
    // The main component's `);\n}` is usually the FIRST one before a `function ` or at end of file.
    let subFuncIdx = c.indexOf('\nfunction ');
    if (subFuncIdx !== -1) {
       let block = c.substring(0, subFuncIdx);
       // replace the last `);` in this block with `</>\n  );`
       let lastRet = block.lastIndexOf(');');
       c = block.substring(0, lastRet) + '</>\n  ' + block.substring(lastRet) + c.substring(subFuncIdx);
    } else {
       let lastRet = c.lastIndexOf(');');
       c = c.substring(0, lastRet) + '</>\n  ' + c.substring(lastRet);
    }
  }
  
  fs.writeFileSync(file, c);
}
