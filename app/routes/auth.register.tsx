/**
 * Salon owner registration.
 */
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import {
  buildAuthCookie,
  getUserFromRequest,
  signJwt,
} from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";

export const meta: MetaFunction = () => [{ title: "Set up your salon — GlowDesk" }];

export async function loader({ request }: LoaderFunctionArgs) {
  if (getUserFromRequest(request)) return redirect("/");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    const user = await AuthService.register({
      username: String(formData.get("username") ?? ""),
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
      error instanceof Error ? error.message : "Registration failed.";
    return { error: message };
  }
}

export default function RegisterPage() {
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
          <div className="t-caption mb-2" style={{ color: "var(--gd-pink-deep)" }}>
            Set up your salon
          </div>
          <h1 className="font-display text-[32px] leading-9" style={{ color: "var(--gd-ink)" }}>
            A calmer way to run the chair.
          </h1>
          <p className="t-body-s t-stone mt-2">
            Smart bookings, automated reminders, and clients who come back.
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
              <label htmlFor="username" className="gd-label">Salon owner name</label>
              <input id="username" name="username" required className="gd-input" />
            </div>
            <div>
              <label htmlFor="email" className="gd-label">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="gd-input" />
            </div>
            <div>
              <label htmlFor="password" className="gd-label">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className="gd-input" />
              <p className="t-body-s t-stone mt-1">At least 8 characters.</p>
            </div>
            <button type="submit" className="gd-btn-primary" disabled={submitting}>
              {submitting ? "Setting up…" : "Create my salon"}
            </button>
            <p className="text-center t-body-s t-stone">
              Already on GlowDesk?{" "}
              <Link to="/auth/login" className="font-semibold" style={{ color: "var(--gd-pink-deep)" }}>
                Sign in
              </Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
}
