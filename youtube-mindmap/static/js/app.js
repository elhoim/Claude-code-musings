// YouTube Mind Map Generator - Client-side JavaScript

let jm = null;
let currentMindMapData = null;
let zoomLevel = 1;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    const generateBtn = document.getElementById('generate-btn');
    const youtubeUrl = document.getElementById('youtube-url');
    const exportPngBtn = document.getElementById('export-png-btn');
    const exportMindmapBtn = document.getElementById('export-mindmap-btn');
    const exportDropdown = document.getElementById('export-dropdown');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const resetViewBtn = document.getElementById('reset-view-btn');

    // Generate mind map
    generateBtn.addEventListener('click', generateMindMap);

    // Allow Enter key to trigger generation
    youtubeUrl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateMindMap();
        }
    });

    // Export PNG
    exportPngBtn.addEventListener('click', exportToPNG);

    // Toggle export dropdown
    exportMindmapBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        exportDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            exportDropdown.classList.remove('show');
        }
    });

    // Export mind map formats
    const exportLinks = exportDropdown.querySelectorAll('a');
    exportLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const format = this.getAttribute('data-format');
            exportMindMap(format);
            exportDropdown.classList.remove('show');
        });
    });

    // Zoom controls
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    resetViewBtn.addEventListener('click', resetView);
}

async function generateMindMap() {
    const urlInput = document.getElementById('youtube-url');
    const youtubeUrl = urlInput.value.trim();
    const errorMsg = document.getElementById('error-message');
    const loading = document.getElementById('loading');
    const generateBtn = document.getElementById('generate-btn');

    // Clear previous errors
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';

    if (!youtubeUrl) {
        showError('Please enter a YouTube URL');
        return;
    }

    // Validate YouTube URL format
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    if (!youtubeRegex.test(youtubeUrl)) {
        showError('Please enter a valid YouTube URL');
        return;
    }

    // Show loading state
    loading.style.display = 'block';
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Generating...</span>';

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: youtubeUrl })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate mind map');
        }

        // Store the mind map data
        currentMindMapData = data.mindmap;

        // Hide instructions, show mind map
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('mindmap-section').style.display = 'block';

        // Render the mind map
        renderMindMap(data.mindmap);

        // Scroll to mind map
        document.getElementById('mindmap-section').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        showError(error.message);
    } finally {
        loading.style.display = 'none';
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-brain"></i> <span>Generate Mind Map</span>';
    }
}

function renderMindMap(mindMapData) {
    // Convert our data format to jsMind format
    const jsMindData = convertToJsMindFormat(mindMapData);

    // Initialize jsMind options
    const options = {
        container: 'jsmind_container',
        editable: true,
        theme: 'primary',
        mode: 'full',
        support_html: true,
        view: {
            hmargin: 100,
            vmargin: 50,
            line_width: 2,
            line_color: '#6366f1'
        },
        layout: {
            hspace: 80,
            vspace: 40,
            pspace: 13
        },
        shortcut: {
            enable: true,
            handles: {},
            mapping: {
                addchild: 45,  // Insert
                addbrother: 13, // Enter
                editnode: 113,  // F2
                delnode: 46,    // Delete
                toggle: 32      // Space
            }
        }
    };

    // Create or update jsMind instance
    if (jm) {
        jm.show(jsMindData);
    } else {
        jm = new jsMind(options);
        jm.show(jsMindData);
    }

    // Apply custom styling
    applyCustomNodeStyles();

    // Reset zoom
    zoomLevel = 1;
}

function convertToJsMindFormat(data, parentId = 'root') {
    const mind = {
        meta: {
            name: 'YouTube Mind Map',
            author: 'YouTube Mind Map Generator',
            version: '1.0'
        },
        format: 'node_tree',
        data: convertNode(data, parentId, true)
    };

    return mind;
}

function convertNode(node, id, isRoot = false) {
    const jsmindNode = {
        id: id,
        topic: node.topic,
        direction: isRoot ? undefined : (Math.random() > 0.5 ? 'left' : 'right'),
        expanded: true
    };

    if (isRoot) {
        jsmindNode.isroot = true;
    }

    if (node.children && node.children.length > 0) {
        jsmindNode.children = node.children.map((child, index) => {
            const childId = `${id}_${index}`;
            return convertNode(child, childId);
        });
    }

    return jsmindNode;
}

function applyCustomNodeStyles() {
    setTimeout(() => {
        const nodes = document.querySelectorAll('jmnode');
        nodes.forEach((node, index) => {
            // Root node gets special styling
            if (node.getAttribute('nodeid') === 'root') {
                node.style.backgroundColor = '#6366f1';
                node.style.color = 'white';
                node.style.fontSize = '18px';
                node.style.fontWeight = 'bold';
                node.style.padding = '15px 25px';
            } else {
                // Gradient colors for child nodes
                const colors = [
                    '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'
                ];
                const colorIndex = index % colors.length;
                node.style.backgroundColor = colors[colorIndex];
                node.style.color = 'white';
                node.style.padding = '10px 20px';
                node.style.fontSize = '14px';
            }
        });
    }, 100);
}

async function exportToPNG() {
    const container = document.getElementById('jsmind_container');

    if (!container) {
        showError('No mind map to export');
        return;
    }

    try {
        // Use html2canvas to capture the mind map
        const canvas = await html2canvas(container, {
            backgroundColor: '#ffffff',
            scale: 2, // Higher quality
            logging: false,
            useCORS: true
        });

        // Convert to blob and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'mindmap.png';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });

    } catch (error) {
        showError('Failed to export PNG: ' + error.message);
    }
}

async function exportMindMap(format) {
    if (!currentMindMapData) {
        showError('No mind map to export');
        return;
    }

    // Get current state from jsMind (in case user edited it)
    const currentData = jm.get_data();
    const updatedMindMap = convertFromJsMindFormat(currentData.data);

    try {
        const response = await fetch(`/api/export/${format}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mindmap: updatedMindMap })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Export failed');
        }

        // Download the file
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Set filename based on format
        const extensions = {
            'freemind': '.mm',
            'xmind': '.xmind.json',
            'opml': '.opml'
        };
        link.download = `mindmap${extensions[format] || ''}`;

        link.click();
        URL.revokeObjectURL(url);

    } catch (error) {
        showError('Failed to export: ' + error.message);
    }
}

function convertFromJsMindFormat(jsmindNode) {
    const node = {
        topic: jsmindNode.topic
    };

    if (jsmindNode.children && jsmindNode.children.length > 0) {
        node.children = jsmindNode.children.map(child => convertFromJsMindFormat(child));
    }

    return node;
}

function zoomIn() {
    zoomLevel = Math.min(zoomLevel + 0.1, 2);
    applyZoom();
}

function zoomOut() {
    zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
    applyZoom();
}

function resetView() {
    zoomLevel = 1;
    applyZoom();

    // Re-center the view
    const container = document.getElementById('jsmind_container');
    container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
    container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
}

function applyZoom() {
    const container = document.getElementById('jsmind_container');
    const canvas = container.querySelector('canvas');

    if (canvas) {
        canvas.style.transform = `scale(${zoomLevel})`;
        canvas.style.transformOrigin = 'center center';
    }

    // Also scale jmnodes if they exist
    const nodes = container.querySelectorAll('jmnode');
    nodes.forEach(node => {
        node.style.transform = `scale(${zoomLevel})`;
    });
}

function showError(message) {
    const errorMsg = document.getElementById('error-message');
    errorMsg.textContent = message;
    errorMsg.style.display = 'flex';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 5000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Only handle shortcuts when mind map is visible
    if (document.getElementById('mindmap-section').style.display === 'none') {
        return;
    }

    // Ctrl/Cmd + Plus: Zoom in
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn();
    }

    // Ctrl/Cmd + Minus: Zoom out
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        zoomOut();
    }

    // Ctrl/Cmd + 0: Reset zoom
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        resetView();
    }
});
