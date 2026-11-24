export type ApiAuthStatus = 401 | 403;

export class ApiAuthError extends Error {
  readonly status: ApiAuthStatus;

  constructor(status: ApiAuthStatus) {
    super(
      status === 401
        ? "ログインの有効期限が切れました。再ログインしてください。"
        : "このアカウントには管理画面の操作権限がありません。"
    );
    this.name = "ApiAuthError";
    this.status = status;
  }
}

export function isApiAuthError(error: unknown): error is ApiAuthError {
  return error instanceof ApiAuthError;
}

export function throwIfAuthError(response: Response): void {
  if (response.status === 401 || response.status === 403) {
    throw new ApiAuthError(response.status);
  }
}
