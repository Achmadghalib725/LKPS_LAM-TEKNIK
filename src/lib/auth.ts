import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const betterAuthInstance = betterAuth({
  appName: "LKPS & LED LAM Teknik",
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "OPERATOR_PRODI" },
      wajibGantiSandi: { type: "boolean", required: false, defaultValue: false },
      prodiId: { type: "string", required: false },
    },
  },
  plugins: [
    nextCookies(),
  ],
});

/**
 * Server-side helper to get current session seamlessly across all routes.
 * Drop-in replacement for old auth() in NextAuth.
 */
export async function auth() {
  const reqHeaders = await headers();
  const session = await betterAuthInstance.api.getSession({ headers: reqHeaders });
  if (!session) return null;

  // Pastikan prodiId terisi dari database User jika di session belum ada
  let prodiId = ((session.user as any).prodiId as string) || null;
  if (!prodiId && session.user?.id) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { prodiId: true, role: true },
      });
      if (dbUser?.prodiId) prodiId = dbUser.prodiId;
    } catch {}
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: ((session.user as any).role as string) || "OPERATOR_PRODI",
      prodiId,
    },
    session,
  };
}

export type SessionAuth = Awaited<ReturnType<typeof auth>>;
