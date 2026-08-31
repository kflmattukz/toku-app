import { authClient } from "#/lib/auth-client";

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--color-surface-2)]" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="h-8 w-8 rounded-full border border-[var(--color-border)] object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)]">
            <span className="text-xs font-extrabold text-[var(--color-text)]">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        )}
        <button
          onClick={() => {
            void authClient.signOut();
          }}
          className="press-tactile h-9 flex-1 cursor-pointer rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-xs font-bold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-2)]"
        >
          Sign out
        </button>
      </div>
    );
  }

  return null;
}
