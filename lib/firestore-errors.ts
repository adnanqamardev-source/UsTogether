export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
  code?: string;
}

/**
 * Logs a structured Firestore error and returns a user-friendly message.
 * NOTE: This no longer throws — the old version silently threw, which
 * masked genuine errors inside try/catch flow. Callers inspect the return.
 */
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  authUser: any | null = null
): string {
  const code = (error as any)?.code as string | undefined;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    code,
    authInfo: {
      userId: authUser?.uid,
      email: authUser?.email,
      emailVerified: authUser?.emailVerified,
      isAnonymous: authUser?.isAnonymous,
      tenantId: authUser?.tenantId,
      providerInfo:
        authUser?.providerData?.map((p: any) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error:", JSON.stringify(errInfo));

  // Map common Firebase codes to friendly messages.
  switch (code) {
    case "permission-denied":
      return "You don't have permission to do that.";
    case "not-found":
      return "That record couldn't be found.";
    case "already-exists":
      return "That record already exists.";
    case "resource-exhausted":
      return "Too many requests. Try again in a moment.";
    case "unavailable":
      return "The service is temporarily unavailable. Try again soon.";
    default:
      return "Something went wrong. Please try again.";
  }
}