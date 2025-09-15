import React, { useState, useEffect } from 'react';
import { ordersService } from '../services/ordersService';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    loadStatuses();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const { data } = await ordersService.getOrders();
    setOrders(data || []);
    setLoading(false);
  };

  const loadStatuses = async () => {
    const { data } = await ordersService.getStatuses();
    setStatuses(data || []);
  };

  const [editFormData, setEditFormData] = useState({
    delivery_date: '',
    status_id: ''
  });

  const getStatusClass = (status) => {
    const statusClasses = {
      'Pending': 'status-pending',
      'Processing': 'status-processing', 
      'Shipped': 'status-shipped',
      'Delivered': 'status-delivered',
      'Cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  };

  const getStatusDisplayName = (statusName) => {
    const statusTranslations = {
      'Pending': 'Beklemede',
      'Processing': 'İşleniyor',
      'Shipped': 'Kargoda', 
      'Delivered': 'Teslim Edildi',
      'Cancelled': 'İptal Edildi'
    };
    return statusTranslations[statusName] || statusName;
  };

  const filteredOrders = orders.filter(order => 
    order.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm) ||
    order.products?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const parseProducts = (productsJson) => {
    try {
      if (!productsJson) return [];
      const products = typeof productsJson === 'string' ? JSON.parse(productsJson) : productsJson;
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('Error parsing products JSON:', error);
      return [];
    }
  };

  const renderProducts = (productsJson) => {
    const products = parseProducts(productsJson);
    
    if (products.length === 0) {
      return <span style={{ color: '#6b7280' }}>Ürün yok</span>;
    }

    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem',
        maxWidth: '450px'
      }}>
        {products.map((product, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.75rem',
            minWidth: '160px',
            maxWidth: '180px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.1s ease'
          }}>
            {product.product_image && (
              <img
                src={`https://cfqzjghngplhzybrbvej.supabase.co/storage/v1/object/public/products-images/${product.product_image}`}
                alt={product.product_name}
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  flexShrink: 0
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontWeight: '600', 
                color: '#1f2937',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '3px',
                lineHeight: '1.2'
              }}>
                {product.product_name || 'Ürün adı yok'}
              </div>
              {product.quantity && (
                <div style={{ 
                  color: '#6b7280', 
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontWeight: '500'
                }}>
                  <span style={{ color: '#3b82f6' }}>×</span> {product.quantity} adet
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setEditFormData({
      delivery_date: order.delivery_date,
      status_id: order.status_id
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu siparişi silmek istediğinizden emin misiniz?')) {
      const { error } = await ordersService.deleteOrder(id);
      if (!error) {
        await loadOrders();
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const { error } = await ordersService.updateOrder(editingOrder.id, editFormData);
    if (!error) {
      await loadOrders();
      setShowEditModal(false);
      setEditingOrder(null);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrintOrder = (order) => {
    const printWindow = window.open('', '_blank');
    const products = parseProducts(order.products);
    const orderDate = new Date(order.created_at).toLocaleDateString('tr-TR');
    const orderTime = new Date(order.created_at).toLocaleTimeString('tr-TR');
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sipariş Faturası #${order.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
            line-height: 1.6;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-info {
            flex: 1;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .company-slogan {
            font-size: 14px;
            color: #666;
          }
          .invoice-title {
            text-align: right;
            flex: 1;
          }
          .invoice-number {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
          }
          .invoice-date {
            color: #666;
            margin-top: 5px;
          }
          .order-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .detail-section {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
          }
          .detail-title {
            font-weight: bold;
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .detail-item {
            margin: 8px 0;
            display: flex;
            justify-content: space-between;
          }
          .detail-label {
            font-weight: 500;
            color: #4b5563;
          }
          .detail-value {
            color: #1f2937;
          }
          .products-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
          }
          .products-table th {
            background: #f1f5f9;
            padding: 12px;
            text-align: left;
            border: 1px solid #e2e8f0;
            font-weight: bold;
            color: #374151;
          }
          .products-table td {
            padding: 12px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
          }
          .product-image {
            width: 40px;
            height: 40px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid #ddd;
          }
          .product-name {
            font-weight: 500;
            color: #1f2937;
          }
          .quantity {
            text-align: center;
            font-weight: 500;
          }
          .price {
            text-align: right;
            font-weight: 500;
          }
          .total-section {
            margin-top: 30px;
            text-align: right;
          }
          .total-row {
            display: flex;
            justify-content: flex-end;
            margin: 10px 0;
            font-size: 18px;
          }
          .total-label {
            margin-right: 20px;
            font-weight: bold;
          }
          .total-value {
            font-weight: bold;
            color: #059669;
            min-width: 120px;
            text-align: right;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-processing { background: #dbeafe; color: #1e40af; }
          .status-shipped { background: #d1fae5; color: #065f46; }
          .status-delivered { background: #dcfce7; color: #166534; }
          .status-cancelled { background: #fee2e2; color: #991b1b; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="company-info">
            <div class="company-name">OTOCAP</div>
            <div class="company-slogan">Kaliteli Hizmet, Güvenilir Çözüm</div>
          </div>
          <div class="invoice-title">
            <div class="invoice-number">SİPARİŞ #${order.id}</div>
            <div class="invoice-date">${orderDate} - ${orderTime}</div>
          </div>
        </div>
        
        <div class="order-details">
          <div class="detail-section">
            <div class="detail-title">Sipariş Bilgileri</div>
            <div class="detail-item">
              <span class="detail-label">Müşteri:</span>
              <span class="detail-value">${order.user || 'Belirtilmemiş'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Sipariş Tarihi:</span>
              <span class="detail-value">${orderDate}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Sipariş Saati:</span>
              <span class="detail-value">${orderTime}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Durum:</span>
              <span class="detail-value">
                <span class="status-badge ${getStatusClass(order.status?.name || 'Pending')}">
                  ${order.status?.display_name || getStatusDisplayName(order.status?.name || 'Pending')}
                </span>
              </span>
            </div>
          </div>
          
          <div class="detail-section">
            <div class="detail-title">Teslimat Bilgileri</div>
            <div class="detail-item">
              <span class="detail-label">Teslimat Tarihi:</span>
              <span class="detail-value">${order.delivery_date || 'Belirtilmemiş'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Toplam Tutar:</span>
              <span class="detail-value" style="font-weight: bold; color: #059669;">
                ${formatCurrency(order.total || 0)}
              </span>
            </div>
          </div>
        </div>
        
        <div class="products-section">
          <table class="products-table">
            <thead>
              <tr>
                <th style="width: 60px;">Resim</th>
                <th>Ürün Adı</th>
                <th style="width: 80px; text-align: center;">Adet</th>
                <th style="width: 120px; text-align: right;">Fiyat</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(product => `
                <tr>
                  <td>
                    ${product.product_image ? 
                      `<img src="https://cfqzjghngplhzybrbvej.supabase.co/storage/v1/object/public/products-images/${product.product_image}" 
                           class="product-image" alt="${product.product_name}" 
                           onerror="this.style.display='none';">` : 
                      '<div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #9ca3af;">Resim<br>Yok</div>'
                    }
                  </td>
                  <td>
                    <div class="product-name">${product.product_name || 'Ürün adı belirtilmemiş'}</div>
                  </td>
                  <td class="quantity">${product.quantity || 1}</td>
                  <td class="price">${formatCurrency(product.price || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="total-section">
          <div class="total-row">
            <div class="total-label">TOPLAM TUTAR:</div>
            <div class="total-value">${formatCurrency(order.total || 0)}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Bu fatura ${orderDate} tarihinde ${orderTime} saatinde otomatik olarak oluşturulmuştur.</p>
          <p>Her türlü soru ve görüşleriniz için bizimle iletişime geçebilirsiniz.</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        <PageHeader 
          title="Sipariş Yönetimi"
        />

        {/* Summary Stats */}
        <div style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="stat-card">
            <div className="stat-title">Toplam Sipariş</div>
            <div className="stat-value">{orders.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Toplam Gelir</div>
            <div className="stat-value">
              {formatCurrency(orders.reduce((sum, order) => sum + (order.total || 0), 0))}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Bekleyen Siparişler</div>
            <div className="stat-value">
              {orders.filter(order => order.status?.name === 'Pending').length}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Tamamlanan Siparişler</div>
            <div className="stat-value">
              {orders.filter(order => order.status?.name === 'Delivered').length}
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Sipariş ara (müşteri, ID, ürün...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Orders Table */}
        <div className="orders-table">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner"></div>
              <p>Siparişler yükleniyor...</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Sipariş ID</th>
                  <th>Müşteri</th>
                  <th>Ürünler</th>
                  <th>Toplam</th>
                  <th>Durum</th>
                  <th>Sipariş Tarihi</th>
                  <th>Teslimat Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      Sipariş bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      {/* Main order row */}
                      <tr>
                        <td>#{order.id}</td>
                        <td>{order.user || 'Bilinmiyor'}</td>
                        <td style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                          {parseProducts(order.products).length} ürün
                        </td>
                        <td>{formatCurrency(order.total || 0)}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(order.status?.name || 'Pending')}`}>
                            {order.status?.display_name || getStatusDisplayName(order.status?.name || 'Pending')}
                          </span>
                        </td>
                        <td>{new Date(order.created_at).toLocaleDateString('tr-TR')}</td>
                        <td>{order.delivery_date || '-'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button 
                              onClick={() => handleEdit(order)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Düzenle
                            </button>
                            <button 
                              onClick={() => handlePrintOrder(order)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                              title="Sipariş Faturasını Yazdır"
                            >
                              🖨️ Yazdır
                            </button>
                            <button 
                              onClick={() => handleDelete(order.id)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Products row */}
                      <tr>
                        <td colSpan="8" style={{ 
                          padding: '0.5rem 1rem 1rem 1rem',
                          backgroundColor: '#fafbfc',
                          borderBottom: '2px solid #e5e7eb'
                        }}>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#6b7280', 
                            marginBottom: '0.25rem',
                            fontWeight: '500'
                          }}>
                            Sipariş Ürünleri:
                          </div>
                          {renderProducts(order.products)}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Edit Order Modal */}
        {showEditModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '500px',
              margin: '1rem'
            }}>
              <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
                Sipariş Güncelle - #{editingOrder?.id}
              </h2>
              
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label className="form-label">Teslimat Tarihi</label>
                  <input
                    type="date"
                    name="delivery_date"
                    value={editFormData.delivery_date}
                    onChange={handleEditInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Durum</label>
                  <select
                    name="status_id"
                    value={editFormData.status_id}
                    onChange={handleEditInputChange}
                    className="form-input"
                    required
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.display_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingOrder(null);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Güncelle
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdersPage;