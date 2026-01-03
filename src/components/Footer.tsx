import { Facebook, Instagram, Mail, MapPin } from "lucide-react";
import logo from "@/assets/lisjaki-logo.jpg";

const Footer = () => {
  return (
    <footer id="contact" className="bg-charcoal text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logo}
                alt="Lisjaki Naklo Logo"
                className="h-12 w-12 rounded-full object-cover bg-primary-foreground"
              />
              <span className="font-bold text-xl">ŠD Lisjaki Naklo</span>
            </div>
            <p className="text-primary-foreground/70 text-sm mb-4 max-w-md">
              Dobrodošli na spletni strani športnega društva Lisjaki Naklo.
              Spremljaj nas na družbenih omrežjih!
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/lisjakinaklo"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>

              <a
                href="https://www.instagram.com/lisjakinaklo/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Kontakt</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-primary-foreground/70">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>Športni Park Naklo, 4202 Naklo, Slovenija</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Mail size={16} className="shrink-0 text-primary" />
                <a href="mailto:lisjaki.naklo@gmail.com" className="hover:text-primary transition-colors">
                  lisjaki.naklo@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-6 text-center">
          <p className="text-primary-foreground/50 text-sm">
            © 2025 ŠD Lisjaki Naklo. Vse pravice pridržane.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
