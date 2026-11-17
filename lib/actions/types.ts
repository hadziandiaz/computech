export type ActionCode =
  | "ok"
  | "error"
  | "auth"
  | "forbidden"
  | "not_configured";

export interface ActionResult<T = unknown> {
  ok: boolean;
  code: ActionCode;
  message: string;
  fieldErrors?: Record<string, string[]>;
  redirectTo?: string;
  data?: T;
}
