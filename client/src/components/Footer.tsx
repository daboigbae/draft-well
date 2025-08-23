import { ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6 px-4 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* Left - Built by */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Built by</span>
          <a
            href="https://digitalartdealers.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            data-testid="link-digital-art-dealers"
          >
            Digital Art Dealers
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Middle - Copyright */}
        <div className="text-sm text-slate-500">
          © {currentYear} Linkedraft. All rights reserved.
        </div>

        {/* Right - Replit referral */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Want to help?</span>
          <a
            href="https://replit.com/refer/ghigareda"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline flex items-center gap-1"
            data-testid="link-replit-refer"
          >
            Sign up for Replit
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}