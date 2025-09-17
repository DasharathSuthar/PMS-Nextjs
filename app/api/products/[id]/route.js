import { products } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { apiResponse } from '@/util/response';
import { eq } from 'drizzle-orm';

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return apiResponse({
        success: false,
        message: 'Product ID is required',
        status: 400,
      });
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, Number(id)));

    if (!product) {
      return apiResponse({
        success: false,
        message: 'Product not found',
        status: 404,
      });
    }

    return apiResponse({
      success: true,
      message: 'Product fetched successfully',
      data: product,
      status: 200,
    });
  } catch (err) {
    console.error('GET Product Error', err);
    return apiResponse({
      success: false,
      message: 'Failed to fetch product',
      errors: err.message,
      status: 500,
    });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { name, category, subCategory, description, price, stock, imageUrl } =
      body;

    // validate fields (basic example, you can extend)
    if (!name || !category || !price) {
      return NextResponse.json(
        { success: false, message: 'Name, category, and price are required' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(products)
      .set({
        name,
        category,
        subCategory,
        description,
        price,
        stock,
        imageUrl,
      })
      .where(eq(products.id, Number(id)))
      .returning();

    if (updated.length === 0) {
      return apiResponse({
        success: false,
        message: 'Product not found',
        status: 404,
      });
    }

    return apiResponse({
      success: true,
      message: 'Product updated successfully',
      data: updated[0],
    });
  } catch (err) {
    return apiResponse({
      success: false,
      message: 'Failed to update product',
      errors: err.message,
      status: 500,
    });
  }
}
