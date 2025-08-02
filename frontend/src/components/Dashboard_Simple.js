import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlService } from '../services/urlService';
import { authService } from '../services/authService';
import './Dashboard.css'; // CSS đơn giản

const Dashboard = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    // Chỉ fetch URLs nếu đã đăng nhập, không bắt buộc
    if (authService.isAuthenticated()) {
      fetchUrls();
    }
  }, []);

  const fetchUrls = async () => {
    try {
      // Chỉ fetch URLs khi đã đăng nhập
      if (authService.isAuthenticated()) {
        const response = await urlService.getMyUrls();
        setUrls(response.urls);
      }
    } catch (err) {
      setError('Không thể tải danh sách URL');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const request = {
        originalUrl,
        customCode: customCode || undefined,
      };
      
      const newUrl = await urlService.shortenUrl(request);
      setUrls([newUrl, ...urls]);
      setOriginalUrl('');
      setCustomCode('');
      setSuccess('URL đã được rút gọn thành công!');
    } catch (err) {
      setError(err.message || 'Rút gọn URL thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setSuccess('URL đã được sao chép!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa URL này?')) return;
    
    try {
      await urlService.deleteUrl(id);
      setUrls(urls.filter(url => url.id !== id));
      setSuccess('URL đã được xóa!');
    } catch (err) {
      setError('Xóa URL thất bại');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Header đơn giản */}
      <div className="dashboard-header">
        <h1>URL Shortener</h1>
        <div className="user-info">
          {authService.isAuthenticated() ? (
            <>
              <span>Xin chào, {currentUser?.firstName} {currentUser?.lastName}!</span>
              <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} className="login-btn">Đăng nhập</button>
          )}
        </div>
      </div>

      {/* Form rút gọn URL */}
      <div className="url-form-section">
        <h2>Rút gọn URL mới</h2>
        <form onSubmit={handleSubmit} className="url-form">
          <div className="form-group">
            <label>URL gốc:</label>
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Mã tùy chỉnh (tùy chọn):</label>
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="my-custom-code"
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Đang xử lý...' : 'Rút gọn URL'}
          </button>
        </form>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>

      {/* Danh sách URL - chỉ hiển thị khi đã đăng nhập */}
      {authService.isAuthenticated() && (
        <div className="urls-section">
          <h2>URL của bạn ({urls.length})</h2>
          {urls.length === 0 ? (
            <p className="no-urls">Bạn chưa có URL nào.</p>
          ) : (
            <div className="urls-list">{urls.map((url) => (
              <div key={url.id} className="url-item">
                <div className="url-info">
                  <div className="url-original">
                    <strong>URL gốc:</strong> {url.originalUrl}
                  </div>
                  <div className="url-short">
                    <strong>URL rút gọn:</strong> 
                    <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">
                      {url.shortUrl}
                    </a>
                  </div>
                  <div className="url-stats">
                    <span>Tạo lúc: {new Date(url.createdAt).toLocaleString('vi-VN')}</span>
                    <span className="separator">|</span>
                    <span>Số lượt click: {url.clickCount}</span>
                  </div>
                </div>
                <div className="url-actions">
                  <button 
                    onClick={() => handleCopy(url.shortUrl)}
                    className="copy-btn"
                  >
                    Sao chép
                  </button>
                  <button 
                    onClick={() => handleDelete(url.id)}
                    className="delete-btn"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
