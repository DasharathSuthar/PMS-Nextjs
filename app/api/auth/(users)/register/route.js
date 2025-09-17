import { apiResponse } from '@/util/response';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { users } from '@/drizzle/schema';
import bcrypt from 'bcryptjs';
import { validatePassword, validateEmail } from '@/validator/user.validator';

export async function POST(req) {
  try {
    const { username, email, password, role, adminSecret } = await req.json();

    if (!username || !email || !password || !role) {
      return apiResponse({
        success: false,
        message: 'All fields are required.',
        status: 400,
      });
    }

    let check = validateEmail(email);

    if (!check.valid) {
      return apiResponse({
        success: false,
        message: check.message,
        status: 400,
      });
    }

    check = validatePassword(password);

    if (!check.valid) {
      return apiResponse({
        success: false,
        message: check.message,
        status: 400,
      });
    }
    // check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return apiResponse({
        success: false,
        message: 'User already exists with the same email',
        status: 400,
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // role assignment
    let finalRole = 'user';
    if (role === 'admin') {
      if (!adminSecret) {
        return apiResponse({
          success: false,
          message: 'Admin secret key is required for admin registration',
          status: 400,
        });
      }
      if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
        return apiResponse({
          success: false,
          message: 'Invalid Admin Secret Key',
          status: 403,
        });
      }
      finalRole = 'admin';
    }

    // create user
    const user = await db
      .insert(users)
      .values({ username, email, password: hashedPassword, role: finalRole })
      .returning();

    const { password: _, ...safeUser } = user[0]; // remove password from response

    return apiResponse({
      success: true,
      message: 'User registered successfully',
      data: safeUser,
      status: 201,
    });
  } catch (err) {
    return apiResponse({
      success: false,
      message: 'Failed to register user',
      errors: err.message,
      status: 500,
    });
  }
}
