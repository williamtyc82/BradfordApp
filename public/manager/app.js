// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB__rdJiwW4fKr2PpxY529eXSovUuzWgoI",
    authDomain: "studio-374816510-d4f3d.firebaseapp.com",
    projectId: "studio-374816510-d4f3d",
    storageBucket: "studio-374816510-d4f3d.firebasestorage.app",
    messagingSenderId: "150759802952",
    appId: "1:150759802952:web:36172a802cfd5665ff307d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

document.addEventListener('DOMContentLoaded', () => {

    // Tab Switching Logic
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.dataset.tab;

            // Update Nav State
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show Target Tab
            tabContents.forEach(content => content.classList.remove('active'));
            // Special case for dashboard vs training since I only built training properly for now
            if (targetTab === 'training') {
                document.getElementById('training-section').classList.add('active');
            } else {
                document.getElementById('dashboard-section').style.display = 'block';
                document.getElementById('training-section').classList.remove('active');
            }
        });
    });

    // File Upload Logic
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const uploadList = document.getElementById('upload-list');

    // Trigger file input
    browseBtn.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('click', (e) => {
        if (e.target !== browseBtn) fileInput.click();
    });

    // Handle Drag Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    // Handle Drop
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    // Handle File Input Change
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        handleFiles(files);
    });

    function handleFiles(files) {
        ([...files]).forEach(uploadFile);
    }

    function uploadFile(file) {
        // Create UI Item
        const item = document.createElement('div');
        item.className = 'upload-item';
        item.innerHTML = `
            <div class="file-info">
                <span class="file-name">${file.name}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            </div>
            <span class="upload-status">0%</span>
        `;
        uploadList.appendChild(item);

        const progressBar = item.querySelector('.progress-fill');
        const statusText = item.querySelector('.upload-status');

        // Firebase Storage Upload
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`training-materials/${file.name}`);
        const task = fileRef.put(file);

        task.on('state_changed',
            function progress(snapshot) {
                const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = percentage + '%';
                statusText.innerText = Math.round(percentage) + '%';
            },
            function error(err) {
                console.error(err);
                statusText.innerText = 'Error';
                statusText.style.color = 'red';
            },
            function complete() {
                statusText.innerText = 'Completed';
                statusText.style.color = 'var(--success-color)';
            }
        );
    }
});
