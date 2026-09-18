const fs = require('fs');
const path = 'src/components/VayuCommandDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Find the launcher button
const launcherStart = '{/* Launcher Button for AQI & Chemical Speciation Modal */}';
const launcherEnd = '          </button>';
const idxStart = content.indexOf(launcherStart);
let idxEnd = content.indexOf(launcherEnd, idxStart);
if (idxStart !== -1 && idxEnd !== -1) {
    idxEnd += launcherEnd.length;
} else {
    console.log("Could not find launcher button");
    process.exit(1);
}

// Find the cards inside the modal to copy them
const gaugeStart = '{/* Regional AQI Hero Gauge Card */}';
const speciationEnd = '{/* Carbon Monoxide (CO) */}';

const modalGaugeStartIdx = content.lastIndexOf(gaugeStart);
let modalSpeciationEndIdx = content.indexOf('</div>', content.indexOf(speciationEnd, modalGaugeStartIdx));
// Actually find the end of the speciation card correctly.
// The speciation card ends 3 divs after Carbon Monoxide.
let searchIdx = content.indexOf(speciationEnd, modalGaugeStartIdx);
for (let i = 0; i < 4; i++) {
    searchIdx = content.indexOf('</div>', searchIdx) + 6;
}
const extractedCards = content.substring(modalGaugeStartIdx, searchIdx);

// Modify the gauge card to be clickable
let restoredCards = extractedCards.replace(
  '<div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle">',
  '<div onClick={() => setIsAqiModalOpen(true)} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle cursor-pointer hover:shadow-md hover:border-rose-300 transition group relative">\n              <div className="absolute top-3 right-3 text-slate-300 group-hover:text-rose-500 transition"><i className="fa-solid fa-expand"></i></div>'
);

// We'll also make the chemical speciation clickable
restoredCards = restoredCards.replace(
  '{/* Chemical Speciation Bars */}\n          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle">',
  '{/* Chemical Speciation Bars */}\n          <div onClick={() => setIsAqiModalOpen(true)} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-subtle cursor-pointer hover:shadow-md hover:border-rose-300 transition group relative">\n            <div className="absolute top-3 right-3 text-slate-300 group-hover:text-rose-500 transition"><i className="fa-solid fa-expand"></i></div>'
);


// Replace the launcher button with the restored cards
content = content.substring(0, idxStart) + restoredCards + '\n' + content.substring(idxEnd);

fs.writeFileSync(path, content);
console.log('Success');
