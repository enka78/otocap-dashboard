import React, { useState, useEffect } from 'react';
import TiptapEditor from './TiptapEditor';
import { productsService } from '../services/productsService';
import { categoriesService } from '../services/categoriesService';
import { brandsService } from '../services/brandsService';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    brand_id: '',
    price: '',
    quantity: '',
    description: '',
    usage_instructions: '',
    is_featured: false,
    order_number: ''
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log('FormData updated:', {
      description: formData.description,
      usage_instructions: formData.usage_instructions,
      fullFormData: formData
    }); // Debug log with detailed info
  }, [formData]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResult, categoriesResult, brandsResult] = await Promise.all([
        productsService.getProducts(),
        categoriesService.getCategories(),
        brandsService.getBrands()
      ]);
      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
      setBrands(brandsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setProducts([]);
      setCategories([]);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 4;
    const currentImageCount = existingImages.length + imageFiles.length;
    
    if (currentImageCount + files.length > maxImages) {
      alert(`En fazla ${maxImages} resim ekleyebilirsiniz!`);
      return;
    }
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Sadece JPG, JPEG, PNG ve WEBP formatlarında resim yükleyebilirsiniz!');
      return;
    }
    
    // Validate file sizes (max 5MB per file)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      alert('Her resim en fazla 5MB olabilir!');
      return;
    }
    
    setImageFiles(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, {
          id: Math.random().toString(36),
          url: e.target.result,
          file: file,
          isNew: true
        }]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removeImage = async (imageId, isExisting = false) => {
    if (isExisting) {
      // If it's an existing image, we can optionally delete it from storage immediately
      // or just remove it from the preview and let the update handle it
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } else {
      setImageFiles(prev => {
        const imagePreview = imagePreviews.find(img => img.id === imageId);
        if (imagePreview) {
          return prev.filter(file => file !== imagePreview.file);
        }
        return prev;
      });
    }
    setImagePreviews(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Get existing image paths that user wants to keep
        const keptImagePaths = existingImages.map(img => img.path);
        await productsService.updateProduct(editingProduct.id, formData, imageFiles, keptImagePaths);
      } else {
        await productsService.createProduct(formData, imageFiles);
      }
      
      await loadData();
      closeForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ürün kaydedilirken hata oluştu!');
    }
  };
  
  const resetForm = () => {
    console.log('Resetting form'); // Debug log
    setFormData({
      name: '',
      category_id: '',
      brand_id: '',
      price: '',
      quantity: '',
      description: '',
      usage_instructions: '',
      is_featured: false,
      order_number: ''
    });
    setImageFiles([]);
    setExistingImages([]);
    setImagePreviews([]);
    setEditingProduct(null);
  };
  
  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (product) => {
    console.log('Product being edited:', product); // Debug log
    console.log('Product description:', product.description); // Debug description
    console.log('Product usage_instructions:', product.usage_instructions); // Debug usage instructions
    
    setEditingProduct(product);
    
    const newFormData = {
      name: product.name || '',
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      price: product.price || '',
      quantity: product.quantity || '',
      description: product.description || '',
      usage_instructions: product.usage_instructions || '',
      is_featured: product.is_featured || false,
      order_number: product.order_number || ''
    };
    
    console.log('Setting formData to:', newFormData); // Debug form data
    setFormData(newFormData);
    
    // Set existing images from individual image fields
    const existingImgs = [];
    const imageFields = ['image1', 'image2', 'image3', 'image4'];
    
    imageFields.forEach((field, index) => {
      if (product[field]) {
        existingImgs.push({
          id: `existing-${index}`,
          url: product.imageUrls[index],
          path: product[field],
          field: field,
          isNew: false
        });
      }
    });
    
    setExistingImages(existingImgs);
    setImagePreviews(existingImgs);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await productsService.deleteProduct(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Ürün silinirken hata oluştu!');
      }
    }
  };

  const filteredProducts = (products || []).filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        <PageHeader 
          title="Ürün Yönetimi"
          onAddNew={() => {
            resetForm();
            setShowForm(true);
          }}
          addButtonText="Yeni Ürün"
        />

        {/* Search */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Ürün ara..."
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

        {/* Products Table */}
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Resim</th>
                <th>Ürün Adı</th>
                <th>Açıklama</th>
                <th>Fiyat</th>
                <th>Stok</th>
                <th>Öne Çıkan</th>
                <th>Sıra</th>
                <th>Oluşturulma</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>
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
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    Ürün bulunamadı
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>
                      {product.imageUrls && product.imageUrls.length > 0 ? (
                        <img 
                          src={product.imageUrls[0]} 
                          alt={product.name}
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          Resim Yok
                        </div>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>
                      <div 
                        style={{
                          maxWidth: '200px',
                          maxHeight: '60px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '0.875rem'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: (product.description && typeof product.description === 'string') ? 
                            (product.description.length > 100 ? 
                              product.description.substring(0, 100) + '...' : 
                              product.description
                            ) : 'Açıklama yok'
                        }}
                      />
                    </td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.quantity}</td>
                    <td>
                      <span className={`status-badge ${product.is_featured ? 'status-delivered' : 'status-pending'}`}>
                        {product.is_featured ? 'Evet' : 'Hayır'}
                      </span>
                    </td>
                    <td>{product.order_number}</td>
                    <td>{new Date(product.created_at).toLocaleDateString('tr-TR')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleEdit(product)}
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
                          onClick={() => handleDelete(product.id)}
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

        {/* Product Form Modal */}
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
              maxWidth: '800px',
              margin: '1rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Ürün Adı</label>
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
                    <label className="form-label">Kategori</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Marka</label>
                    <select
                      name="brand_id"
                      value={formData.brand_id}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="">Marka Seçin</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fiyat</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stok Miktarı</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sıra Numarası</label>
                    <input
                      type="number"
                      name="order_number"
                      value={formData.order_number}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Açıklama</label>
                  <TiptapEditor
                    content={formData.description || ''}
                    onChange={(value) => {
                      console.log('Description changed to:', value);
                      setFormData(prev => ({ ...prev, description: value || '' }));
                    }}
                    placeholder="Ürün açıklamasını girin..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kullanım Talimatları</label>
                  <TiptapEditor
                    content={formData.usage_instructions || ''}
                    onChange={(value) => {
                      console.log('Usage instructions changed to:', value);
                      setFormData(prev => ({ ...prev, usage_instructions: value || '' }));
                    }}
                    placeholder="Kullanım talimatlarını girin..."
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                    />
                    Öne Çıkan Ürün
                  </label>
                </div>

                {/* Image Upload Section */}
                <div className="form-group">
                  <label className="form-label">
                    Ürün Resimleri (En fazla 4 adet)
                  </label>
                  
                  {/* Current Images Display */}
                  {imagePreviews.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1rem',
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      backgroundColor: '#f9fafb'
                    }}>
                      {imagePreviews.map((image) => (
                        <div key={image.id} style={{ position: 'relative' }}>
                          <img
                            src={image.url}
                            alt="Preview"
                            style={{
                              width: '100px',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(image.id, !image.isNew)}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* File Input */}
                  {(existingImages.length + imageFiles.length) < 4 && (
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handleImageChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px dashed #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: '#f9fafb',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginTop: '0.5rem'
                      }}>
                        JPG, JPEG, PNG veya WEBP formatında, her biri en fazla 5MB
                      </div>
                    </div>
                  )}
                  
                  {(existingImages.length + imageFiles.length) >= 4 && (
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #f59e0b',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      color: '#92400e'
                    }}>
                      Maksimum 4 resim eklenebilir. Yeni resim eklemek için mevcut resimlerden birini silin.
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={closeForm}
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
                    {editingProduct ? 'Güncelle' : 'Ekle'}
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

export default ProductsPage;