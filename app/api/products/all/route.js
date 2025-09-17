import { db } from '@/lib/db';
import { products } from '@/drizzle/schema';
import { apiResponse } from '@/util/response';

export async function GET() {
  try {
    const allProducts = await db
      .select()
      .from(products)
      .orderBy(products.category);

    if (!allProducts.length) {
      return apiResponse({
        success: true,
        message: 'No products found',
        data: [],
        status: 200,
      });
    }

    return apiResponse({
      success: true,
      message: 'Products fetched successfully',
      data: allProducts,
      status: 200,
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return apiResponse({
      success: false,
      message: 'Failed to fetch products',
      errors: err.message,
      status: 500,
    });
  }
}
