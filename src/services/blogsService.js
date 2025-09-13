import { supabase } from '../lib/supabase';

export const blogsService = {
  // Get all blogs
  async getBlogs() {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching blogs:', error);
      return { data: [], error };
    }
  },

  // Create new blog
  async createBlog(blogData) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .insert([{ ...blogData, created_add: new Date() }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating blog:', error);
      return { data: null, error };
    }
  },

  // Update existing blog
  async updateBlog(id, blogData) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .update(blogData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating blog:', error);
      return { data: null, error };
    }
  },

  // Delete blog
  async deleteBlog(id) {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting blog:', error);
      return { error };
    }
  }
};