const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

code = code.replace(
  /<\/>\s*\)\}\s*\{activeTab === "Plume Dispersion" && \(/m,
  '</div>\n\n      {activeTab === "Plume Dispersion" && ('
);

fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
console.log('Fixed syntax error!');
