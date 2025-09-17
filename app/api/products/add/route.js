import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { uploadBufferToCloudinary } from '@/lib/cloudinary';
import { db } from '@/lib/db';
import { products } from '@/drizzle/schema';
import { apiResponse } from '@/util/response';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    // Only admin can add products
    if (!session?.user?.id || session.user.role !== 'admin') {
      return apiResponse({
        success: false,
        message: 'Unauthorized. Only admins can add products.',
        status: 403,
      });
    }

    const formData = await req.formData();
    const name = formData.get('name');
    const description = formData.get('description') || null;
    const price = formData.get('price');
    const category = formData.get('category');
    const subCategory = formData.get('subCategory');
    const stock = formData.get('stock') || 0;
    const imageFile = formData.get('image');

    if (!name || !price || !category) {
      return apiResponse({
        success: false,
        message: 'Name, price, and category are required.',
        status: 400,
      });
    }

    let imageUrl = null;
    if (imageFile) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const cloudinaryResponse = await uploadBufferToCloudinary(
        buffer,
        'products'
      );
      imageUrl = cloudinaryResponse.secure_url;
    }

    // Insert product into DB
    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        description,
        price: Number(price),
        category,
        subCategory,
        stock: Number(stock),
        imageUrl,
        createdBy: Number(session.user.id),
      })
      .returning();

    return apiResponse({
      success: true,
      message: 'Product added successfully',
      data: newProduct,
      status: 201,
    });
  } catch (err) {
    console.error('Add Product Error:', err);
    return apiResponse({
      success: false,
      message: 'Failed to add product',
      errors: err.message,
      status: 500,
    });
  }
}
