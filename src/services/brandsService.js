import { supabase } from '../lib/supabase';

export const brandsService = {
  // Get all brands
  async getBrands() {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching brands:', error);
      return { data: [], error };
    }
  },

  // Create new brand
  async createBrand(brandData) {
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert([brandData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating brand:', error);
      return { data: null, error };
    }
  },

  // Update existing brand
  async updateBrand(id, brandData) {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update({ ...brandData, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating brand:', error);
      return { data: null, error };
    }
  },

  // Delete brand
  async deleteBrand(id) {
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting brand:', error);
      return { error };
    }
  }
};