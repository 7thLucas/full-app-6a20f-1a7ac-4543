/**
 * Salon owner login — GlowDesk-styled wrapper around the @qb/authentication API.
 */
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import {
  buildAuthCookie,
  getUserFromRequest,
  signJwt,
} from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";
import { useConfigurables } from "~/modules/configurables";

export const meta: MetaFunction = () => [{ title: "Sign in — GlowDesk" }];

export async function loader({ request }: LoaderFunctionArgs) {
  if (getUserFromRequest(request)) return redirect("/");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    const user = await AuthService.login({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    const token = signJwt({
      sub: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
      email_verified: user.email_verified,
    });
    return redirect("/", {
      headers: {
        "Set-Cookie": buildAuthCookie(token, new URL(request.url).hostname),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Invalid credentials.";
    return { error: message };
  }
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const { config } = useConfigurables();
  const salonName = config?.appName ?? "GlowDesk";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: "var(--gd-cream)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="t-caption mb-2" style={{ color: "var(--gd-pink-deep)" }}>
            GlowDesk
          </div>
          <h1 className="font-display text-[32px] leading-9" style={{ color: "var(--gd-ink)" }}>
            Welcome back, {salonName}.
          </h1>
          <p className="t-body-s t-stone mt-2">
            Sign in to see today's chairs and confirm bookings.
          </p>
        </div>

        <div className="gd-card p-6">
          <Form method="post" className="flex flex-col gap-4">
            {actionData?.error && (
              <div
                className="rounded-xl px-3 py-2 t-body-s"
                style={{ background: "var(--gd-alert-soft)", color: "#8A2D2D" }}
              >
                {actionData.error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="gd-label">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="gd-input" />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="password" className="gd-label">Password</label>
                <Link to="/auth/forgot-password" className="gd-btn-tertiary px-0 text-[12px]">
                  Forgot?
                </Link>
              </div>
              <input id="password" name="password" type="password" autoComplete="current-password" required className="gd-input" />
            </div>
            <button type="submit" className="gd-btn-primary" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
            <p className="text-center t-body-s t-stone">
              New to GlowDesk?{" "}
              <Link to="/auth/register" className="font-semibold" style={{ color: "var(--gd-pink-deep)" }}>
                Set up your salon
              </Link>
            </p>
          </Form>
        </div>

        <p className="text-center t-body-s t-stone mt-6">
          <Link to="/" className="underline underline-offset-4">Continue to dashboard</Link>
        </p>
      </div>
    </div>
  );
}
