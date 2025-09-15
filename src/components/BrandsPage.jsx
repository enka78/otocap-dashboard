import React, { useState, useEffect } from 'react';
import { brandsService } from '../services/brandsService';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';

const BrandsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const result = await brandsService.getBrands();
      setBrands(result.data || []);
    } catch (error) {
      console.error('Error loading brands:', error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    order: '',
    image: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      
      // Upload to Supabase storage brands-images bucket
      const { error } = await supabase.storage
        .from('brands-images')
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
    try {
      if (editingBrand) {
        await brandsService.updateBrand(editingBrand.id, formData);
      } else {
        await brandsService.createBrand(formData);
      }
      
      await loadBrands();
      setFormData({ name: '', order: '', image: '' });
      setShowForm(false);
      setEditingBrand(null);
    } catch (error) {
      console.error('Error saving brand:', error);
      alert('Marka kaydedilirken hata oluştu!');
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      order: brand.order,
      image: brand.image
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
      try {
        await brandsService.deleteBrand(id);
        await loadBrands();
      } catch (error) {
        console.error('Error deleting brand:', error);
        alert('Marka silinirken hata oluştu!');
      }
    }
  };

  const filteredBrands = (brands || []).filter(brand => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        <PageHeader 
          title="Marka Yönetimi"
          onAddNew={() => {
            setShowForm(true);
            setEditingBrand(null);
            setFormData({ name: '', order: '', image: '' });
          }}
          addButtonText="Yeni Marka"
        />

        {/* Search */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Marka ara..."
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

        {/* Brands Table */}
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Marka Adı</th>
                <th>Sıra</th>
                <th>Resim</th>
                <th>Oluşturulma Tarihi</th>
                <th>Güncellenme Tarihi</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
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
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    Marka bulunamadı
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id}>
                    <td>#{brand.id}</td>
                    <td>{brand.name}</td>
                    <td>{brand.order}</td>
                    <td>
                      {brand.image ? (
                        <>
                          <img
                            src={`https://cfqzjghngplhzybrbvej.supabase.co/storage/v1/object/public/brands-images/${brand.image}`}
                            alt={brand.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              border: '1px solid #d1d5db'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'inline';
                            }}
                          />
                          <span style={{ display: 'none', fontSize: '0.75rem', color: '#6b7280' }}>
                            Resim yüklenemedi
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Resim yok</span>
                      )}
                    </td>
                    <td>{new Date(brand.created_at).toLocaleDateString('tr-TR')}</td>
                    <td>{new Date(brand.updated_at).toLocaleDateString('tr-TR')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleEdit(brand)}
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
                          onClick={() => handleDelete(brand.id)}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Brand Form Modal */}
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
              maxWidth: '500px',
              margin: '1rem'
            }}>
              <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
                {editingBrand ? 'Marka Düzenle' : 'Yeni Marka Ekle'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Marka Adı</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sıra</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Marka Resmi</label>
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
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
                          src={`https://cfqzjghngplhzybrbvej.supabase.co/storage/v1/object/public/brands-images/${formData.image}`}
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
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingBrand(null);
                      setFormData({ name: '', order: '', image: '' });
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
                    {editingBrand ? 'Güncelle' : 'Ekle'}
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

export default BrandsPage;