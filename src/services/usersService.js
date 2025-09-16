import { supabaseAdmin } from '../lib/supabase';

export const usersService = {
  // Get all users using Supabase Auth Admin API
  async getUsers() {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      
      if (error) {
        console.error('Supabase auth error:', error);
        throw error;
      }
      
      // Transform the auth users data to match our expected format
      const users = data.users.map(user => ({
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanıcı',
        email: user.email,
        phone: user.phone || user.user_metadata?.phone || '-',
        created_at: user.created_at
      }));
      
      return { data: users, error: null };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: [], error };
    }
  }
};