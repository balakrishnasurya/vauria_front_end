'use client'

import { motion } from 'motion/react';
import { ArrowLeft, Clock, Truck, MapPin, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FOOTER_DATA } from '@/data/footer.data';
import { useMainContext } from '@/context/MainContext';

export default function ShippingPage() {
  const { handleLogoClick } = useMainContext();
  const shippingData = FOOTER_DATA.shipping.content;

  const getIconForSection = (title: string) => {
    switch (title) {
      case 'Processing Time':
        return <Clock className="h-6 w-6 text-primary" />;
      case 'Delivery Options':
        return <Truck className="h-6 w-6 text-primary" />;
      case 'Order Tracking':
        return <MapPin className="h-6 w-6 text-primary" />;
      case 'Shipping Charges':
        return <DollarSign className="h-6 w-6 text-primary" />;
      case 'Lost or Delayed Packages':
        return <AlertTriangle className="h-6 w-6 text-primary" />;
      case 'Packaging':
        return <Package className="h-6 w-6 text-primary" />;
      default:
        return <Truck className="h-6 w-6 text-primary" />;
    }
  };

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
            {shippingData.title}
          </h1>
          <p className="font-sans text-lg text-muted-foreground mb-6">
            {shippingData.description}
          </p>
        </motion.div>

        {/* Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-border">
            <CardContent className="pt-6">
              <p className="font-sans text-muted-foreground leading-relaxed">
                {shippingData.overview}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shipping Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-6"
        >
          {shippingData.sections.map((section, index) => (
            <Card key={section.title} className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getIconForSection(section.title)}
                  <CardTitle className="font-serif text-xl">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="font-sans text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </main>
    </div>
  );
}