import { users } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { apiResponse } from '@/util/response';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendMail } from '@/lib/mailer';
import { resetTokens } from '@/drizzle/schema/resetToken';
import { validateEmail } from '@/validator/user.validator';

export async function POST(req) {
  try {
    const { email } = await req.json();
    console.log('Incoming email:', email);

    if (!email) {
      return apiResponse({
        success: false,
        message: 'Email is required',
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

    const [user] = await db.select().from(users).where(eq(users.email, email));
    console.log('User found:', user);

    if (!user) {
      return apiResponse({
        success: false,
        message: 'No account found',
        status: 404,
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 15);

    console.log('Generated token:', token);

    await db.insert(resetTokens).values({
      userId: user.id,
      token,
      expiresAt: expiry,
    });
    console.log('Token saved to DB ✅');

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    console.log('Reset URL:', resetUrl);

    await sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `<h2>Password Reset Request</h2>
             <p>Hello ${user.username || 'User'},</p>
             <p>Click below to reset your password (valid 15 minutes):</p>
             <a href="${resetUrl}">${resetUrl}</a>`,
    });
    console.log('Email sent ✅');

    return apiResponse({
      success: true,
      message: 'Password reset email sent successfully',
      status: 200,
    });
  } catch (err) {
    console.error('Forgot-password error:', err);
    return apiResponse({
      success: false,
      message: 'Failed to send reset email',
      errors: err.message,
      status: 500,
    });
  }
}
