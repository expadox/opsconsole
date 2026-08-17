import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-panel">
      <div className="mb-8 text-center">
        <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">
          OpsConsole
        </p>
        <SignIn />
      </div>
    </main>
  );
}
