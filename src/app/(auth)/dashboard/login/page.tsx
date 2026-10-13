import { LoginForm } from "@/components/dashboard/LoginForm";

type Props = { searchParams: Promise<{ next?: string }> };

// Only allow redirects to paths on this site, never to another domain.
function safeNext(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand px-4">
      <LoginForm next={safeNext(next)} />
    </main>
  );
}
