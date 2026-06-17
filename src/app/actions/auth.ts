"use server";
import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import { users, passwordResets } from '@/lib/schema';
import { hashPassword } from '@/lib/crypto';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

// Initialize Resend with the provided API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  
  if (!email || !password) return { error: "Missing fields" };
  
  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return { error: "An account with this email already exists. Please log in with Google, or reset your password." };
  }
  
  const hash = await hashPassword(password);
  const id = crypto.randomUUID();
  
  await db.insert(users).values({
    id,
    email,
    name,
    passwordHash: hash
  }).run();
  
  redirect("/login?registered=true");
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return { error: "Email required" };
  
  const db = getDb();
  // We still query the user but we don't leak whether they exist in the UI response
  const user = await db.select().from(users).where(eq(users.email, email)).get();
  
  if (user) {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins validity
    
    await db.insert(passwordResets).values({
      token, email, expiresAt
    }).run();
    
    // In production, use your actual domain environment variable
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    
    try {
      await resend.emails.send({
        from: 'FlexiDash <onboarding@resend.dev>',
        to: email,
        subject: 'Reset your FlexiDash password',
        html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p><p>This link expires in 15 minutes.</p>`
      });
      console.log("Resend API triggered for:", email);
    } catch (e) {
      console.error("Resend error", e);
    }
  }
  
  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  
  if (!token || !password) return { error: "Missing fields" };
  
  const db = getDb();
  const reset = await db.select().from(passwordResets).where(eq(passwordResets.token, token)).get();
  
  if (!reset) return { error: "Invalid token" };
  if (reset.expiresAt < Date.now()) return { error: "Token expired" };
  
  const hash = await hashPassword(password);
  
  // Update the user's password
  await db.update(users).set({ passwordHash: hash }).where(eq(users.email, reset.email)).run();
  
  // Consume the token so it can't be reused
  await db.delete(passwordResets).where(eq(passwordResets.token, token)).run();
  
  return { success: true };
}
