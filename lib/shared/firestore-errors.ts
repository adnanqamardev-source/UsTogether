export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, authUser: any | null = null): string {
  const code = (error as any)?.code as string | undefined;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authUser?.uid,
      email: authUser?.email,
      emailVerified: authUser?.emailVerified,
      isAnonymous: authUser?.isAnonymous,
      tenantId: authUser?.tenantId,
      providerInfo: authUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  // Only log full PII server-side; log sanitized info on the client.
  if (typeof window === 'undefined') {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  } else {
    console.error(`Firestore ${operationType} error on ${path || 'unknown'}: ${code || 'unknown'}`);
  }

  // Return a friendly message instead of throwing with full details.
  switch (code) {
    case 'permission-denied':
      return "You don't have permission to do that.";
    case 'not-found':
      return "That record couldn't be found.";
    case 'already-exists':
      return "That record already exists.";
    case 'resource-exhausted':
      return "Too many requests. Try again in a moment.";
    case 'unavailable':
      return "The service is temporarily unavailable. Try again soon.";
    default:
      return "Something went wrong. Please try again.";
  }
}
