import { supabase } from '../lib/supabase';

export const bannersService = {
  // Get all banners
  async getBanners() {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching banners:', error);
      return { data: [], error };
    }
  },

  // Create new banner
  async createBanner(bannerData) {
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert([bannerData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating banner:', error);
      return { data: null, error };
    }
  },

  // Update existing banner
  async updateBanner(id, bannerData) {
    try {
      const { data, error } = await supabase
        .from('banners')
        .update(bannerData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating banner:', error);
      return { data: null, error };
    }
  },

  // Delete banner
  async deleteBanner(id) {
    try {
      console.log('Deleting banner with ID:', id, 'Type:', typeof id);
      
      // Use the exact Supabase API format for delete operations
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      console.log('Delete result:', { error });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting banner:', error);
      return { error };
    }
  }
};