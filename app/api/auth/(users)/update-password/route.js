import { users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { apiResponse } from '@/util/response';
import { eq } from 'drizzle-orm';
import { authOptions } from '../../[...nextauth]/route';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/validator/user.validator';

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse({
        success: false,
        message: 'Unauthorized for Password',
        status: 401,
      });
    }

    const { password, newPassword } = await req.json();

    if (!password || !newPassword) {
      return apiResponse({
        success: false,
        message: 'Both fields are required',
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

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!user) {
      return apiResponse({
        success: false,
        message: 'User not found',
        status: 404,
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user?.password);

    if (!isPasswordCorrect) {
      return apiResponse({
        success: false,
        message: 'Current Password is wrong',
        status: 400,
      });
    }
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    const [upatedUserPassword] = await db
      .update(users)
      .set({ password: newHashedPassword, passwordChangedAt: new Date() })
      .where(eq(users.email, session.user.email))
      .returning();

    const { password: _, ...safeUser } = upatedUserPassword;

    return apiResponse({
      success: true,
      message: 'Password updated succesfully',
      data: safeUser,
      status: 201,
    });
  } catch (err) {
    return apiResponse({
      success: false,
      message: 'Password updated error',
      errors: err.message,
      status: 500,
    });
  }
}
