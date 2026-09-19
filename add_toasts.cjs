const fs = require('fs');
let code = fs.readFileSync('src/components/VayuCommandDashboard.jsx', 'utf8');

// 1. Add Toast state
const stateInjectionPoint = 'const [actionsTriggered, setActionsTriggered] = useState({});';
const stateWithToast = `const [actionsTriggered, setActionsTriggered] = useState({});
  const [toasts, setToasts] = useState([]);

  const addToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };`;

code = code.replace(stateInjectionPoint, stateWithToast);

// 2. Replace alert() with addToast()
const handleActionOld = `const handleAction = (id, actionName) => {
    setActionsTriggered((prev) => ({ ...prev, [id]: true }));
    alert(\`Action Initiated: \${actionName}\`);
  };`;

const handleActionNew = `const handleAction = (id, actionName) => {
    // Toggle logic so they can click again to undo
    setActionsTriggered((prev) => {
      const isNowActive = !prev[id];
      addToast(isNowActive ? \`✅ Activated: \${actionName}\` : \`🛑 Revoked: \${actionName}\`);
      return { ...prev, [id]: isNowActive };
    });
  };`;

code = code.replace(handleActionOld, handleActionNew);

// 3. Render Toasts at the end of the component
const closingTag = '</div>\n  );\n}';
const toastUI = `
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="bg-slate-900/90 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 fade-in duration-300 pointer-events-auto backdrop-blur-md border border-slate-700/50">
            <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`;

code = code.replace(/<\/div>\s*\);\s*\}/, toastUI);

fs.writeFileSync('src/components/VayuCommandDashboard.jsx', code);
console.log('Toast system injected!');
