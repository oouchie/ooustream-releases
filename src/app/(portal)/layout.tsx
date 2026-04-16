import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth";
import PortalNav from "@/components/portal/PortalNav";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCustomerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PortalNav customerName={session.name} />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
      <footer className="border-t border-[#334155] py-4 text-center text-sm text-[#94a3b8]">
        <p>&copy; {new Date().getFullYear()} Ooustream. All rights reserved.</p>
        <div className="text-xs text-[#64748b] mt-1">
          <a
            href="https://1865freemoney.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00d4ff] transition-colors"
          >
            Powered by 1865 Free Money
          </a>
          <span className="block mt-0.5">Digital Excellence · Atlanta, GA</span>
        </div>
      </footer>
    </div>
  );
}
