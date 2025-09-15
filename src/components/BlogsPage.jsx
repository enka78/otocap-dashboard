import React, { useState, useEffect } from 'react';
import { blogsService } from '../services/blogsService';
import { supabase } from '../lib/supabase';
import TiptapEditor from './TiptapEditor';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';

const BlogsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const result = await blogsService.getBlogs();
      setBlogs(result.data || []);
    } catch (error) {
      console.error('Error loading blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    sub_title: '',
    description: '',
    image: '',
    is_featured: false,
    order: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDescriptionChange = (html) => {
    setFormData(prev => ({
      ...prev,
      description: html
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
      
      // Upload to Supabase storage blogs-images bucket
      const { error } = await supabase.storage
        .from('blogs-images')
        .upload(fileName, file);
      
      if (error) {
        throw error;
      }
      
      // Update form data with new filename
      setFormData(prev => ({
        ...prev,
        image: fileName
      }));
      
      alert('Blog resmi başarıyla yüklendi!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Blog resmi yüklenirken hata oluştu: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBlog) {
        await blogsService.updateBlog(editingBlog.id, formData);
      } else {
        await blogsService.createBlog(formData);
      }
      
      await loadBlogs();
      setFormData({
        title: '',
        sub_title: '',
        description: '',
        image: '',
        is_featured: false,
        order: ''
      });
      setShowForm(false);
      setEditingBlog(null);
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Blog kaydedilirken hata oluştu!');
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      sub_title: blog.sub_title,
      description: blog.description,
      image: blog.image,
      is_featured: blog.is_featured,
      order: blog.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) {
      try {
        await blogsService.deleteBlog(id);
        await loadBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Blog silinirken hata oluştu!');
      }
    }
  };

  const filteredBlogs = (blogs || []);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        <PageHeader 
          title="Blog Yönetimi"
          onAddNew={() => {
            setShowForm(true);
            setEditingBlog(null);
            setFormData({
              title: '',
              sub_title: '',
              description: '',
              image: '',
              is_featured: false,
              order: ''
            });
          }}
          addButtonText="Yeni Blog"
        />

        {/* Blogs Grid */}
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
          ) : filteredBlogs.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px'
            }}>
              Blog bulunamadı
            </div>
          ) : (
            filteredBlogs.map((blog) => (
              <div key={blog.id} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                {/* Blog Image */}
                <div style={{
                  width: '100%',
                  height: '180px',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {blog.image ? (
                    <>
                      <img
                        src={`https://cfqzjghngplhzybrbvej.supabase.co/storage/v1/object/public/blogs-images/${blog.image}`}
                        alt={blog.title}
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

                {/* Blog Content */}
                <div style={{ padding: '1.5rem' }}>
                  {/* Header with Featured Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        lineHeight: '1.4'
                      }}>
                        {blog.title}
                      </h3>
                      {blog.sub_title && (
                        <p style={{
                          margin: '0 0 0.75rem 0',
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          lineHeight: '1.4'
                        }}>
                          {blog.sub_title}
                        </p>
                      )}
                    </div>
                    {blog.is_featured && (
                      <span style={{
                        backgroundColor: '#fef3c7',
                        color: '#d97706',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px',
                        fontWeight: '500',
                        marginLeft: '0.5rem'
                      }}>
                        ⭐ Öne Çıkan
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {blog.description && (
                    <div 
                      style={{
                        margin: '0 0 1rem 0',
                        fontSize: '0.875rem',
                        color: '#4b5563',
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                      dangerouslySetInnerHTML={{ __html: blog.description }}
                    />
                  )}

                  {/* Meta Info */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    <span>Sıra: {blog.order}</span>
                    <span>{new Date(blog.created_add).toLocaleDateString('tr-TR')}</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleEdit(blog)}
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
                      onClick={() => handleDelete(blog.id)}
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

        {/* Blog Form Modal */}
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
                {editingBlog ? 'Blog Düzenle' : 'Yeni Blog Ekle'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Başlık</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    required
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
                  <label className="form-label">Açıklama</label>
                  <TiptapEditor
                    content={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Blog açıklamasını girin..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Blog Resmi</label>
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
                          src={`https://cfqzjghngplhzybrbvej.supabase.co/storage/v1/object/public/blogs-images/${formData.image}`}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                      />
                      Öne Çıkan
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingBlog(null);
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
                    {editingBlog ? 'Güncelle' : 'Ekle'}
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

export default BlogsPage;