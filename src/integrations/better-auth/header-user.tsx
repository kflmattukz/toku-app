import { authClient } from "#/lib/auth-client";

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="h-8 w-8 rounded-full bg-[var(--color-surface-2)] animate-pulse" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img src={session.user.image} alt="" className="h-8 w-8 rounded-full object-cover border border-[var(--color-border)]" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center">
            <span className="text-xs font-extrabold text-[var(--color-text)]">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
        )}
        <button
          onClick={() => {
            void authClient.signOut();
          }}
          className="press-tactile flex-1 h-9 px-4 text-xs font-bold bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-full hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    );
  }

  return null;
}
