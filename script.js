// Estado Global
let mediaLibrary = JSON.parse(localStorage.getItem('vico_media_lib')) || [];

// Iniciar
document.addEventListener('DOMContentLoaded', () => {
    renderLibrary();
    
    // Registrar SW
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(() => console.log('SW Registrado'));
    }
});

// Guardar en LocalStorage
function saveLibrary() {
    localStorage.setItem('vico_media_lib', JSON.stringify(mediaLibrary));
    renderLibrary();
}

// Renderizar Biblioteca
function renderLibrary() {
    const container = document.getElementById('library');
    container.innerHTML = '';

    if (mediaLibrary.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Biblioteca vacía. Añade contenido.</p>';
        return;
    }

    mediaLibrary.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'media-card';
        // Imagen por defecto si falla o no tiene
        const img = item.cover || 'https://via.placeholder.com/300x450/000000/00fff7?text=VICO+MEDIA';
        
        card.innerHTML = `
            <button class="delete-btn" onclick="deleteMedia(${index})">X</button>
            <img src="${img}" class="card-img" alt="${item.title}" onerror="this.src='https://via.placeholder.com/300x450/000/fff?text=No+Cover'">
            <div class="card-info">
                <div class="card-title">${item.title}</div>
            </div>
            <div class="play-overlay" onclick="openPlayer('${item.url}', '${item.title.replace(/'/g, "\\'")}')">
                <i data-lucide="play" size="48" style="color: white; fill: white;"></i>
            </div>
        `;
        container.appendChild(card);
    });
    lucide.createIcons();
}

// Agregar Manualmente
function addManualMedia() {
    const title = document.getElementById('mediaTitle').value.trim();
    const url = document.getElementById('mediaUrl').value.trim();
    const cover = document.getElementById('mediaCover').value.trim();

    if (!title || !url) return alert('Título y URL obligatorios');

    mediaLibrary.push({ title, url, cover });
    saveLibrary();
    
    // Limpiar inputs
    document.getElementById('mediaTitle').value = '';
    document.getElementById('mediaUrl').value = '';
    document.getElementById('mediaCover').value = '';
    toggleSection('add-manual'); // Cerrar panel
}

// Procesar Lista M3U / Texto
function processList() {
    const text = document.getElementById('listInput').value;
    const lines = text.split('\n');
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF')) {
            // Es formato M3U: #EXTINF:-1,Titulo \n URL
            const titlePart = line.split(',')[1] || 'Sin Título';
            const urlPart = lines[i+1]?.trim();
            if (urlPart && urlPart.startsWith('http')) {
                mediaLibrary.push({ title: titlePart, url: urlPart, cover: '' });
                count++;
                i++; // Saltar la linea de URL ya leída
            }
        } else if (line.startsWith('http')) {
            // URL suelta
            mediaLibrary.push({ title: `Video Importado ${count+1}`, url: line, cover: '' });
            count++;
        }
    }

    if (count > 0) {
        saveLibrary();
        alert(`${count} videos importados.`);
        document.getElementById('listInput').value = '';
        toggleSection('import-list');
    } else {
        alert('No se detectaron enlaces válidos.');
    }
}

// Borrar
function deleteMedia(index) {
    if (confirm('¿Eliminar este video?')) {
        mediaLibrary.splice(index, 1);
        saveLibrary();
    }
}

// Mostrar/Ocultar Secciones
function toggleSection(id) {
    const el = document.getElementById(id);
    el.classList.toggle('hidden');
}

// --- LOGICA DEL REPRODUCTOR INTEGRADO ---
function openPlayer(url, title) {
    const modal = document.getElementById('playerModal');
    const container = document.getElementById('videoContainer');
    const titleEl = document.getElementById('playerTitle');
    
    titleEl.innerText = title;
    container.innerHTML = ''; // Limpiar anterior

    let content = '';

    // Detectar tipo de video
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // Extraer ID de YouTube
        let videoId = url.split('v=')[1];
        if (!videoId && url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
        const amp = videoId ? videoId.indexOf('&');
        if (amp !== -1) videoId = videoId.substring(0, amp);
        
        content = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allowfullscreen></iframe>`;
    } 
    else if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')) {
        // Video Nativo
        content = `<video src="${url}" controls autoplay style="width:100%; height:100%"></video>`;
    } 
    else {
        // Iframe genérico (para embeds, wiseplay streams si lo soportan, etc)
        content = `<iframe src="${url}" allowfullscreen></iframe>`;
    }

    container.innerHTML = content;
    modal.classList.remove('hidden');
}

function closePlayer() {
    const modal = document.getElementById('playerModal');
    const container = document.getElementById('videoContainer');
    container.innerHTML = ''; // Parar video
    modal.classList.add('hidden');
}
