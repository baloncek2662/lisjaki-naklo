import { useState } from "react";
import { Menu, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/lisjaki-logo.jpg";

const navLinks = [
  { name: "Domov", href: "/", isAnchor: true },
  { name: "Tekme", href: "/tekme", isAnchor: false },
  { name: "Novice", href: "/novice", isAnchor: false },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = (href: string, isAnchor: boolean) => {
    setIsOpen(false);
    if (isAnchor && location.pathname === "/") {
      const element = document.querySelector(href.replace("/", ""));
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Lisjaki Naklo Logo"
              className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover"
            />
            <span className="font-bold text-lg md:text-xl text-foreground">
              NK Lisjaki Naklo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isAnchor ? (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => handleNavClick(link.href, link.isAnchor)}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* CTA Button - Contact */}
          <div className="hidden lg:block">
            <Button variant="default" size="lg" asChild>
              <a href="mailto:lisjaki.naklo@gmail.com" className="flex items-center gap-2">
                <Mail size={18} />
                Kontakt
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.isAnchor ? (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-base font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                    onClick={() => handleNavClick(link.href, link.isAnchor)}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-base font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <Button variant="default" size="lg" className="mt-4 w-full" asChild>
                <a href="mailto:lisjaki.naklo@gmail.com" className="flex items-center justify-center gap-2">
                  <Mail size={18} />
                  Kontakt
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
