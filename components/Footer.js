import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand text-gray-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-bold text-white">
            Gravodaya <span className="text-gold">Developers</span>
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Your trusted partner in finding the perfect property across
            Uttarakhand. Quality homes, transparent deals.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-gold">
                Home
              </Link>
            </li>
            <li>
              <Link href="/properties" className="hover:text-gold">
                Properties
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gold">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-400">
            <li>📍 Dehradun, Uttarakhand</li>
            <li>📞 +91 63501 50676</li>
            <li>✉️ info@gravodaya.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-light py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Gravodaya Developers Pvt. Ltd. All rights
        reserved.
      </div>
    </footer>
  );
}
