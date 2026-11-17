import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3001",
});

export interface UserSessionData {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    prodiId?: string | null;
  };
  session?: any;
}

export function useSession() {
  const res = authClient.useSession();
  const data = res.data
    ? {
        ...res.data,
        user: {
          ...res.data.user,
          role: (res.data.user as any).role || "OPERATOR_PRODI",
          prodiId: (res.data.user as any).prodiId || null,
        },
      }
    : null;

  return {
    data: data as UserSessionData | null,
    status: res.isPending ? ("loading" as const) : res.data ? ("authenticated" as const) : ("unauthenticated" as const),
    isPending: res.isPending,
  };
}

export const signOut = async (options?: { callbackUrl?: string }) => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = options?.callbackUrl || "/login";
      },
    },
  });
};

export const signIn = authClient.signIn;
