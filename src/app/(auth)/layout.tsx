import Link from "next/link"
import { Logo } from "@/components/shared/logo"
import { ThemeToggle } from "@/components/providers/theme-toggle"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground transition-colors duration-200">
      {/* Top Header */}
      <header className="flex h-16 items-center justify-between px-6 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        <ThemeToggle variant="icon" />
      </header>

      {/* Main Content Centered */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/40">
        RECALL — Personal Digital Memory & Context Recovery
      </footer>
    </div>
  )
}
