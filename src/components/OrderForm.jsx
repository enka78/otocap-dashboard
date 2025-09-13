
import React, { useState, useEffect } from 'react';
import { ordersService } from '../services/ordersService';
import { X, Save, Loader2 } from 'lucide-react';

const OrderForm = ({ order = null, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    user_name: '',
    products: '',
    total: '',
    currency: 'TRY',
    delivery_date: '',
    delivery_time: '',
    delivery_notes: '',
    status_id: 1,
    appointment_date: ''
  });
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStatuses, setLoadingStatuses] = useState(true);

  useEffect(() => {
    loadStatuses();
    if (order) {
      setFormData({
        user_name: order.user_name || '',
        products: order.products || '',
        total: order.total || '',
        currency: order.currency || 'TRY',
        delivery_date: order.delivery_date || '',
        delivery_time: order.delivery_time || '',
        delivery_notes: order.delivery_notes || '',
        status_id: order.status_id || 1,
        appointment_date: order.appointment_date ? order.appointment_date.slice(0, 16) : ''
      });
    }
  }, [order]);

  const loadStatuses = async () => {
    const { data } = await ordersService.getStatuses();
    setStatuses(data || []);
    setLoadingStatuses(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        total: parseFloat(formData.total) || 0,
        appointment_date: formData.appointment_date || null
      };

      let result;
      if (order) {
        result = await ordersService.updateOrder(order.id, orderData);
      } else {
        result = await ordersService.createOrder(orderData);
      }

      if (result.error === null) {
        onSave();
        onClose();
      }
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {order ? 'Siparişi Düzenle' : 'Yeni Sipariş Oluştur'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Müşteri Adı
              </label>
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Toplam Tutar
              </label>
              <input
                type="number"
                step="0.01"
                name="total"
                value={formData.total}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Para Birimi
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Durum
              </label>
              <select
                name="status_id"
                value={formData.status_id}
                onChange={handleChange}
                disabled={loadingStatuses}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {statuses.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teslimat Tarihi
              </label>
              <input
                type="date"
                name="delivery_date"
                value={formData.delivery_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Teslimat Saati
              </label>
              <input
                type="time"
                name="delivery_time"
                value={formData.delivery_time}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Randevu Tarihi ve Saati
              </label>
              <input
                type="datetime-local"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ürünler (JSON formatı)
            </label>
            <textarea
              name="products"
              value={formData.products}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder='{"product1": 2, "product2": 1}'
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teslimat Notları
            </label>
            <textarea
              name="delivery_notes"
              value={formData.delivery_notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Kaydediliyor...' : (order ? 'Güncelle' : 'Oluştur')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;