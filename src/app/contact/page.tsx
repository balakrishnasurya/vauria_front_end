'use client'

import { motion } from 'motion/react';
import { ArrowLeft, Phone, Mail, Instagram, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FOOTER_DATA } from '@/data/footer.data';
import { useMainContext } from '@/context/MainContext';

export default function ContactPage() {
  const { handleLogoClick } = useMainContext();
  const contactData = FOOTER_DATA.contact.content;

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 lg:px-6 py-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={handleLogoClick}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            {contactData.title}
          </h1>
          <p className="font-sans text-lg text-muted-foreground">
            {contactData.description}
          </p>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {contactData.methods.map((method, index) => (
            <Card key={method.type} className="border-border">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2">
                  {method.type === 'Phone' && <Phone className="h-8 w-8 text-primary" />}
                  {method.type === 'Email' && <Mail className="h-8 w-8 text-primary" />}
                  {method.type === 'Instagram DM' && <Instagram className="h-8 w-8 text-primary" />}
                </div>
                <CardTitle className="font-serif text-xl">{method.type}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-sans text-lg font-medium mb-2">{method.value}</p>
                <p className="font-sans text-sm text-muted-foreground">
                  {method.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Business Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-primary" />
                <CardTitle className="font-serif text-xl">Business Hours</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-sans">
                  <span className="font-medium">Weekdays:</span> {contactData.businessHours.weekdays}
                </p>
                <p className="font-sans">
                  <span className="font-medium">Weekends:</span> {contactData.businessHours.weekends}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}