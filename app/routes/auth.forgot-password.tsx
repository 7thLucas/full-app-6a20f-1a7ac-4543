import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";

export const meta: MetaFunction = () => [{ title: "Forgot password — GlowDesk" }];

export async function loader({ request }: LoaderFunctionArgs) {
  if (getUserFromRequest(request)) return redirect("/");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    await AuthService.forgotPassword(String(formData.get("email") ?? ""));
  } catch {
    // Always return success to prevent email enumeration.
  }
  return {
    success: true,
    message:
      "If that email is on file, a reset link is on the way. Check your inbox.",
  };
}

export default function ForgotPasswordPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: "var(--gd-cream)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="font-display text-[28px]" style={{ color: "var(--gd-ink)" }}>
            Reset your password
          </h1>
          <p className="t-body-s t-stone mt-2">We'll email you a link to set a new one.</p>
        </div>
        <div className="gd-card p-6">
          <Form method="post" className="flex flex-col gap-4">
            {actionData?.success && (
              <div
                className="rounded-xl px-3 py-2 t-body-s"
                style={{ background: "var(--gd-success-soft)", color: "#14633F" }}
              >
                {actionData.message}
              </div>
            )}
            <div>
              <label htmlFor="email" className="gd-label">Email</label>
              <input id="email" name="email" type="email" required className="gd-input" />
            </div>
            <button type="submit" className="gd-btn-primary" disabled={submitting}>
              {submitting ? "Sending…" : "Send reset link"}
            </button>
            <p className="text-center t-body-s t-stone">
              <Link to="/auth/login" className="underline underline-offset-4">
                Back to sign in
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}
