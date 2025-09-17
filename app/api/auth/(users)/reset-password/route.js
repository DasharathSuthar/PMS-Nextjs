import { db } from '@/lib/db';
import { users } from '@/drizzle/schema/user';
import { resetTokens } from '@/drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { apiResponse } from '@/util/response';
import { validatePassword } from '@/validator/user.validator';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return apiResponse({
        success: false,
        message: 'Missing fields',
        status: 400,
      });
    }

    let check = validatePassword(newPassword);

    if (!check.valid) {
      return apiResponse({
        success: false,
        message: check.message,
        status: 400,
      });
    }

    // check token
    const [storedToken] = await db
      .select()
      .from(resetTokens)
      .where(
        and(eq(resetTokens.token, token), gt(resetTokens.expiresAt, new Date()))
      );

    if (!storedToken) {
      return apiResponse({
        success: false,
        message: 'Invalid or expired token',
        status: 400,
      });
    }

    // hash password
    const hashed = await bcrypt.hash(newPassword, 10);

    // update user
    await db
      .update(users)
      .set({ password: hashed, passwordChangedAt: new Date() })
      .where(eq(users.id, storedToken.userId));

    // delete token (one-time use)
    await db.delete(resetTokens).where(eq(resetTokens.id, storedToken.id));

    return apiResponse({
      success: true,
      message: 'Password updated successfully',
      status: 200,
    });
  } catch (err) {
    return apiResponse({
      success: false,
      message: 'Password reset failed',
      errors: err.message,
      status: 500,
    });
  }
}
