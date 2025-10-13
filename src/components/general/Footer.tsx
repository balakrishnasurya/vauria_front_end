'use client'; 

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Crown,
  Heart,
  Linkedin
} from 'lucide-react';
import { FOOTER_DATA, FOOTER_NAVIGATION } from '@/data/footer.data';
import { toast } from 'sonner';
const logoImagePath = '/logo.png';

interface FooterProps {
  onAboutClick?: () => void;
}

export function Footer({ onAboutClick }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const footerSections = [
    {
      title: "Shop",
      links: FOOTER_NAVIGATION.shop
    },
    {
      title: "Customer Care",
      links: FOOTER_NAVIGATION.customerCare
    }
  ];

  const handleNewsletterSubscribe = () => {
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Show success message
    toast.success('Successfully subscribed to our newsletter!');
    setIsSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter Section */}
      <section className="py-12 lg:py-16 px-4 lg:px-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Crown className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="font-serif text-2xl lg:text-3xl font-bold mb-4">
              Join the Royal Newsletter
            </h3>
            <p className="font-sans text-muted-foreground mb-6 max-w-2xl mx-auto">
              Be the first to know about new collections, exclusive offers, and royal events.
            </p>
            
            {!isSubscribed ? (
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your royal email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNewsletterSubscribe()}
                  className="flex-1 h-12 bg-background border-border font-sans"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={handleNewsletterSubscribe}
                    className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-sans"
                  >
                    Subscribe
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                  <Crown className="h-5 w-5" />
                  <span>Thank you for joining our royal newsletter!</span>
                </div>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-3 font-sans">
              By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Footer Content */}
      <div className="py-12 lg:py-16 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <img src={logoImagePath} alt="Vauria" className="h-12 mb-4" />
                {/* Brand Description - COMMENTED OUT FOR LATER USE
                <p className="font-sans text-muted-foreground mb-6 max-w-md">
                  Crafted for Queens since 2020. We create exquisite jewelry pieces that celebrate 
                  the queen in every woman, combining traditional craftsmanship with modern elegance.
                </p>
                */}
                
                {/* Contact Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm font-sans">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>{FOOTER_DATA.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-sans">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{FOOTER_DATA.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-sans">
                    <Instagram className="h-4 w-4 text-primary" />
                    <span>Instagram DM: {FOOTER_DATA.contact.instagram}</span>
                  </div>
                  {/* Location/Address - COMMENTED OUT FOR LATER USE
                  <div className="flex items-center gap-3 text-sm font-sans">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Royal Palace Complex, Mumbai 400001</span>
                  </div>
                  */}
                </div>
                
                {/* Social Links */}
                <div className="flex gap-3">
                  {[
                    { icon: Facebook, href: "#" },
                    { icon: Instagram, href: "#" },
                    { icon: Twitter, href: "#" },
                    { icon: Youtube, href: "#" },
                    { icon: Linkedin, href: "https://www.linkedin.com/in/vauria-crafted-for-queens-34a172388/" }
                  ].map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      className="p-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <social.icon className="h-5 w-5" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, sectionIndex) => (
              <div key={section.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
                >
                  <h4 className="font-serif font-medium mb-4">{section.title}</h4>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <motion.li key={link.name}>
                        {link.name === "Our Story" && onAboutClick ? (
                          <button 
                            onClick={onAboutClick}
                            className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors text-left cursor-pointer"
                          >
                            {link.name}
                          </button>
                        ) : (
                          <a 
                            href={link.href}
                            className="font-sans text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {link.name}
                          </a>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator className="mx-4 lg:mx-6" />

      {/* Bottom Footer */}
      <div className="py-6 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 text-sm font-sans text-muted-foreground">
              <span>© {currentYear} Vauria.</span>
              <Heart className="h-4 w-4 text-primary fill-current" />
              <span>Crafted for Queens</span>
            </div>
            
            <div className="flex gap-6 text-sm font-sans">
              <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}