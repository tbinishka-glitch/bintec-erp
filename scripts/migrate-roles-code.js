const fs = require('fs');
const path = require('path');

const mapping = {
  'SUPER_ADMIN': 'Super Admin',
  'HR_ADMIN': 'Corporate Admin',
  'ADMIN': 'IT Admin',
  'NETWORK_ADMIN': 'Network Admin',
  'BRANCH_ADMIN': 'Branch Admin',
  'STAFF': 'User'
};

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
        walk(fullPath);
      }
    } else if (
      fullPath.endsWith('.ts') || 
      fullPath.endsWith('.tsx') || 
      fullPath.endsWith('.js') || 
      fullPath.endsWith('.mjs')
    ) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      const roles = Object.keys(mapping);
      for (let j = 0; j < roles.length; j++) {
        const oldRole = roles[j];
        const newRole = mapping[oldRole];
        
        // Handle single quotes
        const sPattern = new RegExp("'" + oldRole + "'", 'g');
        if (sPattern.test(content)) {
          content = content.replace(sPattern, "'" + newRole + "'");
          changed = true;
        }
        
        // Handle double quotes
        const dPattern = new RegExp('"' + oldRole + '"', 'g');
        if (dPattern.test(content)) {
          content = content.replace(dPattern, '"' + newRole + '"');
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

const srcDir = path.join(process.cwd(), 'src');
console.log('Starting migration in: ' + srcDir);
walk(srcDir);
console.log('Migration complete.');
