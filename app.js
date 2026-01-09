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
const orderForm = document.getElementById('orderForm');
const ordersTable = document.getElementById('ordersTable').getElementsByTagName('tbody')[0];
const maxWarning = document.getElementById('maxWarning');
const confirmModal = document.getElementById('confirmModal');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');


let orders = [];
let deleteIndex = null;
let editIndex = null;

// Çöp kutusunu yükle
function loadTrash() {
    const saved = localStorage.getItem('trash');
    return saved ? JSON.parse(saved) : [];
}

// Çöp kutusunu kaydet
function saveTrash(trash) {
    localStorage.setItem('trash', JSON.stringify(trash));
}

// LocalStorage'dan kayıtları yükle
function loadOrders() {
    const saved = localStorage.getItem('orders');
    orders = saved ? JSON.parse(saved) : [];
}

// Kayıtları LocalStorage'a kaydet
function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Tabloyu güncelle
function renderTable() {
    ordersTable.innerHTML = '';
    orders.forEach((order, i) => {
        const row = ordersTable.insertRow();
        row.insertCell().textContent = i + 1;
        row.insertCell().textContent = order.name;
        row.insertCell().textContent = order.product;
        row.insertCell().textContent = order.price + ' ₺';
        row.insertCell().textContent = order.payment;
        row.insertCell().textContent = order.status;
        // Düzenle butonu
        const editCell = row.insertCell();
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Düzenle';
        editBtn.className = 'edit';
        editBtn.onclick = () => startEdit(i);
        editCell.appendChild(editBtn);
        // Sil butonu
        const deleteCell = row.insertCell();
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Sil';
        deleteBtn.className = 'delete';
        deleteBtn.onclick = () => showDeleteModal(i);
        deleteCell.appendChild(deleteBtn);
    });
}

// Kayıt ekle
orderForm.onsubmit = function(e) {
    e.preventDefault();
    if (orders.length >= 100) {
        maxWarning.style.display = 'block';
        return;
    } else {
        maxWarning.style.display = 'none';
    }
    const order = {
        name: document.getElementById('name').value.trim(),
        product: document.getElementById('product').value.trim(),
        price: parseFloat(document.getElementById('price').value),
        payment: document.getElementById('payment').value,
        status: document.getElementById('status').value
    };
    if (editIndex !== null) {
        orders[editIndex] = order;
        editIndex = null;
        orderForm.querySelector('button[type="submit"]').textContent = 'Ekle';
    } else {
        orders.push(order);
    }
    saveOrders();
    renderTable();
    orderForm.reset();
};

// Düzenleme başlat
function startEdit(index) {
    const order = orders[index];
    document.getElementById('name').value = order.name;
    document.getElementById('product').value = order.product;
    document.getElementById('price').value = order.price;
    document.getElementById('payment').value = order.payment;
    document.getElementById('status').value = order.status;
    editIndex = index;
    orderForm.querySelector('button[type="submit"]').textContent = 'Güncelle';
}

// Silme modalını göster
function showDeleteModal(index) {
    confirmModal.style.display = 'flex';
    deleteIndex = index;
}

// Silmeyi onayla

confirmDeleteBtn.onclick = function() {
    if (deleteIndex !== null) {
        // Silinen kaydı çöp kutusuna ekle
        const deletedOrder = orders.splice(deleteIndex, 1)[0];
        let trash = loadTrash();
        trash.push({
            ...deletedOrder,
            deletedAt: new Date().toISOString()
        });
        saveTrash(trash);
        saveOrders();
        renderTable();
        deleteIndex = null;
    }
    confirmModal.style.display = 'none';
};

// Silmeyi iptal et
cancelDeleteBtn.onclick = function() {
    deleteIndex = null;
    confirmModal.style.display = 'none';
};

// Sayfa yüklenince kayıtları yükle ve tabloyu göster
window.onload = function() {
    loadOrders();
    renderTable();
};
