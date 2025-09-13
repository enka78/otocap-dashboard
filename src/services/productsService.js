import { supabase } from '../lib/supabase';

// Helper function to get image URLs from storage
const getImageUrls = (product) => {
  const imageUrls = [];
  const baseUrl = 'https://cfqzjghngplhzybrbvej.supabase.co/storage/v1/object/public/products-images/';
  
  // Check each image field and create full URL
  if (product.image1) imageUrls.push(baseUrl + product.image1);
  if (product.image2) imageUrls.push(baseUrl + product.image2);
  if (product.image3) imageUrls.push(baseUrl + product.image3);
  if (product.image4) imageUrls.push(baseUrl + product.image4);
  
  return imageUrls;
};

// Helper function to upload images to storage
const uploadImages = async (files) => {
  const uploadedPaths = [];
  
  for (const file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('products-images')
      .upload(fileName, file);
    
    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
    
    uploadedPaths.push(data.path);
  }
  
  return uploadedPaths;
};

// Helper function to delete images from storage
const deleteImages = async (imagePaths) => {
  if (!imagePaths || imagePaths.length === 0) return;
  
  const pathsToDelete = imagePaths.filter(path => path); // Remove null/undefined values
  if (pathsToDelete.length === 0) return;
  
  const { error } = await supabase.storage
    .from('products-images')
    .remove(pathsToDelete);
  
  if (error) {
    console.error('Error deleting images:', error);
  }
};

export const productsService = {
  // Get all products with category and brand info
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:category_id(id, name),
          brand:brand_id(id, name)
        `)
        .order('order_number', { ascending: true });

      if (error) throw error;
      
      // Add image URLs to each product
      const productsWithImages = data.map((product) => {
        const imageUrls = getImageUrls(product);
        return { ...product, imageUrls };
      });
      
      return { data: productsWithImages, error: null };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { data: [], error };
    }
  },

  // Create new product
  async createProduct(productData, imageFiles = []) {
    try {
      let imagePaths = [];
      
      // Upload images if provided
      if (imageFiles && imageFiles.length > 0) {
        imagePaths = await uploadImages(imageFiles);
      }
      
      // Prepare data with individual image fields
      const dataWithImages = {
        ...productData,
        image1: imagePaths[0] || null,
        image2: imagePaths[1] || null,
        image3: imagePaths[2] || null,
        image4: imagePaths[3] || null
      };
      
      const { data, error } = await supabase
        .from('products')
        .insert([dataWithImages])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating product:', error);
      return { data: null, error };
    }
  },

  // Update existing product
  async updateProduct(id, productData, imageFiles = [], existingImagePaths = []) {
    try {
      let allImagePaths = [...existingImagePaths];
      
      // Upload new images if provided
      if (imageFiles && imageFiles.length > 0) {
        const newImagePaths = await uploadImages(imageFiles);
        allImagePaths = [...allImagePaths, ...newImagePaths];
      }
      
      // Ensure we only keep up to 4 images
      allImagePaths = allImagePaths.slice(0, 4);
      
      const dataWithImages = {
        ...productData,
        image1: allImagePaths[0] || null,
        image2: allImagePaths[1] || null,
        image3: allImagePaths[2] || null,
        image4: allImagePaths[3] || null,
        updated_at: new Date()
      };
      
      const { data, error } = await supabase
        .from('products')
        .update(dataWithImages)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating product:', error);
      return { data: null, error };
    }
  },

  // Delete product
  async deleteProduct(id) {
    try {
      // First get the product to delete its images
      const { data: product } = await supabase
        .from('products')
        .select('image1, image2, image3, image4')
        .eq('id', id)
        .single();
      
      // Delete images from storage
      if (product) {
        const imagePaths = [product.image1, product.image2, product.image3, product.image4].filter(Boolean);
        if (imagePaths.length > 0) {
          await deleteImages(imagePaths);
        }
      }
      
      // Delete product from database
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { error };
    }
  },
  
  // Delete specific images from a product
  async deleteProductImage(productId, imageField) {
    try {
      const updateData = {
        [imageField]: null,
        updated_at: new Date()
      };
      
      // Get the image path to delete from storage
      const { data: product } = await supabase
        .from('products')
        .select(imageField)
        .eq('id', productId)
        .single();
      
      if (product && product[imageField]) {
        await deleteImages([product[imageField]]);
      }
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error deleting product image:', error);
      return { data: null, error };
    }
  }
};