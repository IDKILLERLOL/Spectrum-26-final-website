const fs = require('fs');

function fixFile(file, replacer) {
  let c = fs.readFileSync(file, 'utf8');
  c = replacer(c);
  fs.writeFileSync(file, c);
}

fixFile('./src/pages/AuditLogPage.tsx', c => {
  return c.replace(/import \{ Download, Search \} from 'lucide-react';/, "import { Download, Search } from 'lucide-react';\nimport { useState } from 'react';");
});

fixFile('./src/pages/EventDetailPage.tsx', c => {
  c = c.replace(/import \{ MapPin \} from 'lucide-react';/g, '');
  c = c.replace(/import \{ Users \} from 'lucide-react';/g, '');
  c = c.replace(/import \{ Calendar \} from 'lucide-react';/g, '');
  c = c.replace(/import \{ Trophy \} from 'lucide-react';/g, '');
  c = c.replace(/import \{ ArrowLeft \} from 'lucide-react';/g, '');
  return c;
});

fixFile('./src/pages/RegistrationsPage.tsx', c => {
  return c.replace(/import \{ CheckCircle2, X \} from 'lucide-react';/g, "");
});
