"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/leads", label: "Leads" },
  { href: "/users", label: "Users & Hierarchy" },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav
      style={{
        background: "rgba(17, 17, 26, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "0 1.25rem",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 62,
          gap: "1rem",
        }}
      >
        <Link
          href="/"
          style={{
            fontWeight: 800,
            fontSize: "1.1rem",
            color: "var(--text-primary)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            letterSpacing: "-0.02em",
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ⚡ LeadOS
          </span>
        </Link>

        <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", overflowX: "auto" }}>
          {links.map(({ href, label }) => {
            const isActive = path === href || (href !== "/" && path?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "0.45rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: "none",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive ? "var(--accent-glow)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(108, 99, 255, 0.4)" : "transparent"}`,
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
