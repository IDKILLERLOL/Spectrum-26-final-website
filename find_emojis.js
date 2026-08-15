const fs = require('fs');
const path = require('path');

const emojis = ['🏆','🎮','📷','🎧','⚡','💡','🔥','🎯','✅','❌','🔒','🔓','📱','💬','📧','🌟','⭐','🌠','⚽','🧠','☠','📯','🎉','🎁','📅','📍','📌','🔗','🏠','👥','👤','✉️','📨','🕐','⏰','💰','💵','📋','🔍','ℹ️','⚠️','🔔','➡️','→','↗️','📞','🌐'];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const dirs = [
  'c:\\Users\\Admin\\Documents\\spectrum\\Spectrum-26\\app\\(flagship)',
  'c:\\Users\\Admin\\Documents\\spectrum\\Spectrum-26\\components\\flagship'
];

dirs.forEach(dir => {
  walkDir(dir, (filePath) => {
    if (filePath.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const found = emojis.some(e => content.includes(e));
      if (found) {
        console.log(filePath);
      }
    }
  });
});
