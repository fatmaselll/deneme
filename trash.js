// Tema geçişi
function setTheme(mode) {
    document.body.classList.toggle('light', mode === 'light');
    localStorage.setItem('theme', mode);
}

window.addEventListener('DOMContentLoaded', function() {
    const themeSwitch = document.getElementById('themeSwitch');
    // Tercihi yükle
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    themeSwitch.checked = savedTheme === 'light';
    themeSwitch.addEventListener('change', function() {
        setTheme(this.checked ? 'light' : 'dark');
    });
});
const trashTable = document.getElementById('trashTable').getElementsByTagName('tbody')[0];
const emptyTrashBtn = document.getElementById('emptyTrash');
const confirmTrashModal = document.getElementById('confirmTrashModal');
const confirmTrashDeleteBtn = document.getElementById('confirmTrashDelete');
const cancelTrashDeleteBtn = document.getElementById('cancelTrashDelete');
const trashModalText = document.getElementById('trashModalText');

let trash = [];
let deleteIndex = null;
let deleteAll = false;

function loadTrash() {
    const saved = localStorage.getItem('trash');
    trash = saved ? JSON.parse(saved) : [];
}

function saveTrash() {
    localStorage.setItem('trash', JSON.stringify(trash));
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString('tr-TR');
}

function renderTrash() {
    trashTable.innerHTML = '';
    const now = Date.now();
    trash.forEach((item, i) => {
        // 7 gün geçtiyse otomatik sil
        if (now - new Date(item.deletedAt).getTime() > 7 * 24 * 60 * 60 * 1000) {
            return;
        }
        const row = trashTable.insertRow();
        row.insertCell().textContent = i + 1;
        row.insertCell().textContent = item.name;
        row.insertCell().textContent = item.product;
        row.insertCell().textContent = item.price + ' ₺';
        row.insertCell().textContent = item.payment;
        row.insertCell().textContent = item.status;
        row.insertCell().textContent = formatDate(item.deletedAt);
        // Geri al butonu
        const restoreCell = row.insertCell();
        const restoreBtn = document.createElement('button');
        restoreBtn.textContent = 'Geri Al';
        restoreBtn.className = 'edit';
        restoreBtn.onclick = () => restoreItem(i);
        restoreCell.appendChild(restoreBtn);
        // Kalıcı sil butonu
        const permDeleteCell = row.insertCell();
        const permDeleteBtn = document.createElement('button');
        permDeleteBtn.textContent = 'Sil';
        permDeleteBtn.className = 'delete';
        permDeleteBtn.onclick = () => showTrashDeleteModal(i);
        permDeleteCell.appendChild(permDeleteBtn);
    });
}

function restoreItem(index) {
    // Siparişler listesine geri ekle
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    if (orders.length < 100) {
        orders.push({
            name: trash[index].name,
            product: trash[index].product,
            price: trash[index].price,
            payment: trash[index].payment,
            status: trash[index].status
        });
        localStorage.setItem('orders', JSON.stringify(orders));
        trash.splice(index, 1);
        saveTrash();
        renderTrash();
    } else {
        alert('Sipariş listesi dolu!');
    }
}

function showTrashDeleteModal(index) {
    confirmTrashModal.style.display = 'flex';
    deleteIndex = index;
    deleteAll = false;
    trashModalText.textContent = 'Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?';
}

function showEmptyTrashModal() {
    confirmTrashModal.style.display = 'flex';
    deleteAll = true;
    trashModalText.textContent = 'Tüm çöp kutusunu kalıcı olarak silmek istediğinize emin misiniz?';
}

confirmTrashDeleteBtn.onclick = function() {
    if (deleteAll) {
        trash = [];
    } else if (deleteIndex !== null) {
        trash.splice(deleteIndex, 1);
    }
    saveTrash();
    renderTrash();
    confirmTrashModal.style.display = 'none';
    deleteIndex = null;
    deleteAll = false;
};

cancelTrashDeleteBtn.onclick = function() {
    confirmTrashModal.style.display = 'none';
    deleteIndex = null;
    deleteAll = false;
};

emptyTrashBtn.onclick = showEmptyTrashModal;

// 7 günü geçenleri otomatik sil
function autoDeleteOld() {
    const now = Date.now();
    trash = trash.filter(item => now - new Date(item.deletedAt).getTime() <= 7 * 24 * 60 * 60 * 1000);
    saveTrash();
}

window.onload = function() {
    loadTrash();
    autoDeleteOld();
    renderTrash();
};
