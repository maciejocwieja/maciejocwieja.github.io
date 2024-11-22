// Initialize Mermaid
mermaid.initialize({ 
    startOnLoad: true,
    securityLevel: 'loose'
});

// Define zoom constatnts
const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 10.0;
const INITIAL_ZOOM = 1.0;

// Pan & Zoom state
let scale = INITIAL_ZOOM;
let panning = false;
let pointX = 0;
let pointY = 0;
let start = { x: 0, y: 0 };

const tree = document.getElementById('tree');
const popup = document.getElementById('popup');

function centerFamilyTree() {
    const container = document.getElementById('container');
    pointX = (container.offsetWidth - tree.offsetWidth * scale) / 2;
    pointY = 0;
    setTransform();
}

function bindNodeEvents() {
    document.querySelectorAll('#tree g.node').forEach(node => {
        node.addEventListener('click', (e) => {
            e.stopPropagation();
            const nodeId = node.id.replace('flowchart-n', '');
            showPersonInfo(nodeId.split('_'));
        });
    });
}

function showPersonInfo(ids) {
    const personInfo = document.querySelector('.person-info');
    let content = '';

    ids.forEach(id => {
        const person = familyData.find(p => p.id === parseInt(id));
        if (person) {
            let name = `${person.first_name} ${person.last_name}`;
            let details = `${person.maiden_name ? `<p>Z domu ${person.maiden_name}</p>` : ''}${person.years ? `<p class="years">${person.years}</p>` : ''}${person.description ? `<p class="text">${person.description}</p>` : ''}`;
            if(details) {
                content += `<h2>${name}</h2>` + details + '<hr>';
            } else {
                showToast(`Brak danych dla: ${name}`);
            }
        }
    });

    if (content) {
        personInfo.innerHTML = content;
        popup.style.display = 'block';
    }
}

// Toast message handler
function showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto-dismiss
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Event handlers
tree.onmousedown = function(e) {
    if (!e.target.closest('g.node')) {
        e.preventDefault();
        start = { x: e.clientX - pointX, y: e.clientY - pointY };
        panning = true;
    }
}

document.onmouseup = () => panning = false;

document.onmousemove = function(e) {
    if (!panning) return;
    pointX = (e.clientX - start.x);
    pointY = (e.clientY - start.y);
    setTransform();
}

document.addEventListener('wheel', function(e) {
    e.preventDefault();
    const xs = (e.clientX - pointX) / scale;
    const ys = (e.clientY - pointY) / scale;
    
    scale *= e.deltaY < 0 ? (1 + ZOOM_STEP) : (1 - ZOOM_STEP);
    scale = Math.min(Math.max(MIN_ZOOM, scale), MAX_ZOOM);
    
    pointX = e.clientX - xs * scale;
    pointY = e.clientY - ys * scale;
    
    setTransform();
}, { passive: false });

// Helper functions
function setTransform() {
    tree.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
}

function zoomIn() {
    scale = Math.min(scale * (1 + ZOOM_STEP), MAX_ZOOM);
    setTransform();
}

function zoomOut() {
    scale = Math.max(scale * (1 - ZOOM_STEP), MIN_ZOOM);
    setTransform();
}

function resetView() {
    scale = INITIAL_ZOOM;
    pointX = 0;
    pointY = 0;
    setTransform();
}

function closePopup() {
    popup.style.display = 'none';
}

// Initialize
window.onload = async () => {

    setTimeout(() => {
        bindNodeEvents();
        centerFamilyTree();
    }, 100);
};

// Event listeners
window.onresize = centerFamilyTree;


document.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && !e.target.closest('g.node')) {
        closePopup();
    }
});