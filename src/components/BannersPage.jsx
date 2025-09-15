import React, { useState, useEffect } from 'react';
import { bannersService } from '../services/bannersService';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';

const BannersPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const result = await bannersService.getBanners();
      setBanners(result.data || []);
    } catch (error) {
      console.error('Error loading banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    sub_title: '',
    btn_text: '',
    add_link: '',
    add_button: false,
    image: '',
    start_date: '',
    end_date: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from('banner-images')
        .upload(fileName, file);
      
      if (error) {
        throw error;
      }
      
      // Update form data with new filename
      setFormData(prev => ({
        ...prev,
        image: fileName
      }));
      
      alert('Resim başarıyla yüklendi!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Resim yüklenirken hata oluştu: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Resim zorunlu kontrolü
    if (!formData.image) {
      alert('Banner resmi zorunludur! Lütfen bir resim yükleyin.');
      return;
    }
    
    try {
      if (editingBanner) {
        const result = await bannersService.updateBanner(editingBanner.id, formData);
        if (result.error) {
          throw new Error(result.error.message || 'Güncelleme hatası');
        }
      } else {
        const result = await bannersService.createBanner(formData);
        if (result.error) {
          throw new Error(result.error.message || 'Oluşturma hatası');
        }
      }
      
      await loadBanners();
      setFormData({
        title: '',
        sub_title: '',
        btn_text: '',
        add_link: '',
        add_button: false,
        image: '',
        start_date: '',
        end_date: ''
      });
      setShowForm(false);
      setEditingBanner(null);
      alert(editingBanner ? 'Banner başarıyla güncellendi!' : 'Banner başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Banner kaydedilirken hata oluştu: ' + error.message);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      sub_title: banner.sub_title,
      btn_text: banner.btn_text,
      add_link: banner.add_link,
      add_button: banner.add_button,
      image: banner.image,
      start_date: banner.start_date,
      end_date: banner.end_date
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    console.log('Delete button clicked for banner ID:', id, 'Type:', typeof id);
    
    if (window.confirm('Bu bannerı silmek istediğinizden emin misiniz?')) {
      try {
        console.log('Attempting to delete banner with ID:', id);
        const result = await bannersService.deleteBanner(id);
        
        console.log('Delete service result:', result);
        
        if (result.error) {
          throw new Error(result.error.message || 'Silme hatası');
        }
        
        await loadBanners();
        alert('Banner başarıyla silindi!');
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Banner silinirken hata oluştu: ' + error.message);
      }
    }
  };

  const filteredBanners = (banners || []);

  const isActive = (banner) => {
    const now = new Date();
    const start = new Date(banner.start_date);
    const end = new Date(banner.end_date);
    return now >= start && now <= end;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        <PageHeader 
          title="Banner Yönetimi"
          onAddNew={() => {
            setShowForm(true);
            setEditingBanner(null);
            setFormData({
              title: '',
              sub_title: '',
              btn_text: '',
              add_link: '',
              add_button: false,
              image: '',
              start_date: '',
              end_date: ''
            });
          }}
          addButtonText="Yeni Banner"
        />

        {/* Search Removed */}

        {/* Banners Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {loading ? (
            // Loading cards
            [...Array(6)].map((_, index) => (
              <div key={index} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Yükleniyor...
                </div>
              </div>
            ))
          ) : filteredBanners.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px'
            }}>
              Banner bulunamadı
            </div>
          ) : (
            filteredBanners.map((banner) => (
              <div key={banner.id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
              }}>
                {/* Banner Image */}
                <div style={{
                  width: '100%',
                  height: '180px',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {banner.image ? (
                    <>
                      <img
                        src={`https://cfqzjghngplhzybrbvej.supabase.co/storage/v1/object/public/banner-images/${banner.image}`}
                        alt={banner.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        color: '#6b7280',
                        fontSize: '0.875rem'
                      }}>
                        🖼️ Resim yüklenemedi
                      </div>
                    </>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      📷 Resim yok
                    </div>
                  )}
                </div>

                {/* Banner Content */}
                <div style={{ padding: '1.5rem' }}>
                  {/* Header with Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: banner.title ? '#1f2937' : '#9ca3af',
                        lineHeight: '1.4',
                        fontStyle: banner.title ? 'normal' : 'italic'
                      }}>
                        {banner.title || 'Başlıksız Banner'}
                      </h3>
                      {banner.sub_title && (
                        <p style={{
                          margin: '0',
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          lineHeight: '1.4'
                        }}>
                          {banner.sub_title}
                        </p>
                      )}
                    </div>
                    <span className={`status-badge ${isActive(banner) ? 'status-processing' : 'status-cancelled'}`} style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      fontWeight: '500'
                    }}>
                      {isActive(banner) ? '🟢 Aktif' : '🔴 Pasif'}
                    </span>
                  </div>

                  {/* Banner Details */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                      <div>
                        <span style={{ color: '#6b7280', fontWeight: '500' }}>Başlangıç:</span>
                        <div style={{ color: '#1f2937' }}>{new Date(banner.start_date).toLocaleDateString('tr-TR')}</div>
                      </div>
                      <div>
                        <span style={{ color: '#6b7280', fontWeight: '500' }}>Bitiş:</span>
                        <div style={{ color: '#1f2937' }}>{new Date(banner.end_date).toLocaleDateString('tr-TR')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Button Info */}
                  {banner.add_button && banner.btn_text && (
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Buton:</div>
                      <div style={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                        {banner.btn_text}
                      </div>
                      {banner.add_link && (
                        <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.25rem' }}>
                          {banner.add_link}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleEdit(banner)}
                      style={{
                        flex: 1,
                        padding: '0.5rem 1rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                      ✏️ Düzenle
                    </button>
                    <button 
                      onClick={() => handleDelete(banner.id)}
                      style={{
                        flex: 1,
                        padding: '0.5rem 1rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Banner Form Modal */}
        {showForm && (
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
              maxWidth: '600px',
              margin: '1rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
                {editingBanner ? 'Banner Düzenle' : 'Yeni Banner Ekle'}
              </h2>
              
              {/* Banner Preview */}
              <div style={{
                  marginBottom: '2rem',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}>
                  <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                    👁️ Banner Önizlemesi
                  </h3>
                  <div style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    maxWidth: '300px'
                  }}>
                    {formData.image ? (
                      <div style={{ height: '120px', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                        <img
                          src={`https://cfqzjghngplhzybrbvej.supabase.co/storage/v1/object/public/banner-images/${formData.image}`}
                          alt="Önizleme"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        height: '120px',
                        backgroundColor: '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#dc2626',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        ⚠️ Resim gerekli!
                      </div>
                    )}
                    <div style={{ padding: '1rem' }}>
                      {(formData.title || formData.sub_title) && (
                        <h4 style={{ 
                          margin: '0 0 0.5rem 0', 
                          fontSize: '1rem', 
                          fontWeight: '600',
                          color: formData.title ? '#1f2937' : '#9ca3af',
                          fontStyle: formData.title ? 'normal' : 'italic'
                        }}>
                          {formData.title || 'Başlıksız Banner'}
                        </h4>
                      )}
                      {formData.sub_title && (
                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
                          {formData.sub_title}
                        </p>
                      )}
                      {formData.add_button && formData.btn_text && (
                        <button style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          cursor: 'default'
                        }}>
                          {formData.btn_text}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Başlık (Opsiyonel)</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Banner başlığı girin (opsiyonel)"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Alt Başlık</label>
                    <input
                      type="text"
                      name="sub_title"
                      value={formData.sub_title}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Buton Metni</label>
                    <input
                      type="text"
                      name="btn_text"
                      value={formData.btn_text}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Link</label>
                    <input
                      type="text"
                      name="add_link"
                      value={formData.add_link}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Başlangıç Tarihi</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bitiş Tarihi</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Banner Resmi *</label>
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      required={!formData.image}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}
                    />
                    {uploading && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#3b82f6' }}>
                        Yükleniyor...
                      </div>
                    )}
                    {formData.image && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <img
                          src={`https://cfqzjghngplhzybrbvej.supabase.co/storage/v1/object/public/banner-images/${formData.image}`}
                          alt="Önizleme"
                          style={{
                            width: '100px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #d1d5db'
                          }}
                        />
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          Mevcut: {formData.image}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="veya resim dosya adını manuel girin"
                    style={{ fontSize: '0.875rem' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="add_button"
                      checked={formData.add_button}
                      onChange={handleInputChange}
                    />
                    Buton Ekle
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingBanner(null);
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
                    {editingBanner ? 'Güncelle' : 'Ekle'}
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

export default BannersPage;