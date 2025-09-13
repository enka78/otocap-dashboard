import { supabase } from '../lib/supabase';

export const ordersService = {
  // Get all orders with status information
  async getOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          status:status_id(id, name, display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { data: [], error };
    }
  },

  // Get order statuses for dropdown
  async getStatuses() {
    try {
      const { data, error } = await supabase
        .from('status')
        .select('*')
        .order('id');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching statuses:', error);
      return { data: [], error };
    }
  },

  // Update existing order
  async updateOrder(id, orderData) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating order:', error);
      return { data: null, error };
    }
  },

  // Delete order
  async deleteOrder(id) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting order:', error);
      return { error };
    }
  }
};