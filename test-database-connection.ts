import { supabase } from './src/integrations/supabase/client';

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test connection by fetching categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError);
      return false;
    }

    console.log('✅ Categories table accessible. Found', categories?.length || 0, 'categories');
    
    // Test products table
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return false;
    }

    console.log('✅ Products table accessible. Found', products?.length || 0, 'products');
    
    // Test brands table
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('*')
      .limit(5);

    if (brandsError) {
      console.error('❌ Error fetching brands:', brandsError);
      return false;
    }

    console.log('✅ Brands table accessible. Found', brands?.length || 0, 'brands');
    
    console.log('✅ All database tests passed! Connection is working properly.');
    return true;
  } catch (err) {
    console.error('❌ Unexpected error during database test:', err);
    return false;
  }
}

// Run the test
testDatabaseConnection().then(success => {
  if (success) {
    console.log('🎉 Database connection is properly configured and accessible!');
  } else {
    console.log('❌ Failed to connect to the database. Please check your configuration.');
  }
});