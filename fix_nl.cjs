const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

code = code.replace(/\]\);\\n\\n  \/\//g, ']);\n\n  //');

fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
console.log('Fixed literal newlines!');
