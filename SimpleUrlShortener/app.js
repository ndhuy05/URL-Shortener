// Cấu hình API
const API_BASE = 'http://localhost:5000/api';
let currentUser = null;
let authToken = null;

// Load trạng thái đăng nhập khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    loadUserFromStorage();
    updateUI();
});

// Lưu và tải thông tin user từ localStorage
function saveUserToStorage(user, token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    currentUser = user;
    authToken = token;
}

function loadUserFromStorage() {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        authToken = savedToken;
    }
}

function clearUserFromStorage() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    currentUser = null;
    authToken = null;
}

// Cập nhật giao diện dựa trên trạng thái đăng nhập
function updateUI() {
    if (currentUser) {
        // Đã đăng nhập
        document.getElementById('authButtons').classList.add('hidden');
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        
        document.getElementById('userInfo').classList.remove('hidden');
        document.getElementById('urlForm').classList.remove('hidden');
        document.getElementById('urlList').classList.remove('hidden');
        
        document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        
        loadMyUrls();
    } else {
        // Chưa đăng nhập
        document.getElementById('authButtons').classList.remove('hidden');
        
        document.getElementById('userInfo').classList.add('hidden');
        document.getElementById('urlForm').classList.add('hidden');
        document.getElementById('urlList').classList.add('hidden');
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.add('hidden');
    }
}

// Hiển thị form đăng nhập
function showLogin() {
    document.getElementById('authButtons').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('loginError').textContent = '';
}

// Hiển thị form đăng ký
function showRegister() {
    document.getElementById('authButtons').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('registerError').textContent = '';
}

// Ẩn form auth
function hideAuth() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('authButtons').classList.remove('hidden');
}

// Đăng nhập
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        document.getElementById('loginError').textContent = 'Vui lòng nhập đầy đủ thông tin';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/users/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            saveUserToStorage(data, data.token);
            updateUI();
            // Clear form
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
        } else {
            document.getElementById('loginError').textContent = data.message || 'Đăng nhập thất bại';
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'Lỗi kết nối đến server';
        console.error('Login error:', error);
    }
}

// Đăng ký
async function register() {
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    if (!firstName || !lastName || !email || !password) {
        document.getElementById('registerError').textContent = 'Vui lòng nhập đầy đủ thông tin';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/users/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            saveUserToStorage(data, data.token);
            updateUI();
            // Clear form
            document.getElementById('registerFirstName').value = '';
            document.getElementById('registerLastName').value = '';
            document.getElementById('registerEmail').value = '';
            document.getElementById('registerPassword').value = '';
        } else {
            document.getElementById('registerError').textContent = data.message || 'Đăng ký thất bại';
        }
    } catch (error) {
        document.getElementById('registerError').textContent = 'Lỗi kết nối đến server';
        console.error('Register error:', error);
    }
}

// Đăng xuất
function logout() {
    clearUserFromStorage();
    updateUI();
}

// Rút gọn URL
async function shortenUrl() {
    const originalUrl = document.getElementById('originalUrl').value;
    const customCode = document.getElementById('customCode').value;
    
    if (!originalUrl) {
        document.getElementById('shortenError').textContent = 'Vui lòng nhập URL';
        return;
    }
    
    try {
        const requestBody = { originalUrl };
        if (customCode) {
            requestBody.customCode = customCode;
        }
        
        // Chọn endpoint phù hợp
        const endpoint = currentUser ? '/urls/shorten' : '/urls/demo-shorten';
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Chỉ thêm Authorization header nếu đã đăng nhập
        if (currentUser && authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('shortenSuccess').textContent = `URL rút gọn: ${data.shortUrl}`;
            document.getElementById('shortenError').textContent = '';
            // Clear form
            document.getElementById('originalUrl').value = '';
            document.getElementById('customCode').value = '';
            // Reload URL list
            loadMyUrls();
        } else {
            document.getElementById('shortenError').textContent = data.message || 'Rút gọn URL thất bại';
            document.getElementById('shortenSuccess').textContent = '';
        }
    } catch (error) {
        document.getElementById('shortenError').textContent = 'Lỗi kết nối đến server';
        document.getElementById('shortenSuccess').textContent = '';
        console.error('Shorten URL error:', error);
    }
}

// Tải danh sách URL của user
async function loadMyUrls() {
    try {
        const response = await fetch(`${API_BASE}/urls/my-urls`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayUrls(data.urls);
        } else {
            console.error('Failed to load URLs:', data);
        }
    } catch (error) {
        console.error('Load URLs error:', error);
    }
}

// Hiển thị danh sách URL
function displayUrls(urls) {
    const urlsContainer = document.getElementById('urls');
    
    if (urls.length === 0) {
        urlsContainer.innerHTML = '<p>Bạn chưa có URL nào.</p>';
        return;
    }
    
    const urlsHtml = urls.map(url => `
        <div class="url-item">
            <div class="url-original">URL gốc: ${url.originalUrl}</div>
            <div class="url-short">URL rút gọn: <a href="${url.shortUrl}" target="_blank">${url.shortUrl}</a></div>
            <div class="url-stats">
                Tạo lúc: ${new Date(url.createdAt).toLocaleString('vi-VN')} | 
                Số lượt click: ${url.clickCount}
            </div>
            <button onclick="deleteUrl(${url.id})" class="btn-danger">Xóa</button>
        </div>
    `).join('');
    
    urlsContainer.innerHTML = urlsHtml;
}

// Xóa URL
async function deleteUrl(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa URL này?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/urls/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            loadMyUrls(); // Reload danh sách
        } else {
            alert('Xóa URL thất bại');
        }
    } catch (error) {
        alert('Lỗi kết nối đến server');
        console.error('Delete URL error:', error);
    }
}
