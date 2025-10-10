'use client'

import { motion } from 'motion/react';
import { ArrowLeft, Shield, Droplets, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FOOTER_DATA } from '@/data/footer.data';
import { useMainContext } from '@/context/MainContext';

export default function CareInstructionsPage() {
  const { handleLogoClick } = useMainContext();
  const careData = FOOTER_DATA.careInstructions.content;

  const getIconForTip = (title: string) => {
    switch (title) {
      case 'Daily Care':
        return <Shield className="h-6 w-6 text-primary" />;
      case 'Storage':
        return <Home className="h-6 w-6 text-primary" />;
      case 'Cleaning':
        return <Sparkles className="h-6 w-6 text-primary" />;
      default:
        return <Shield className="h-6 w-6 text-primary" />;
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
            {careData.title}
          </h1>
          <p className="font-sans text-lg text-muted-foreground mb-6">
            {careData.description}
          </p>
        </motion.div>

        {/* Main Care Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-border">
            <CardContent className="pt-6">
              <p className="font-sans text-muted-foreground leading-relaxed">
                {careData.mainText}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Care Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-6"
        >
          {careData.tips.map((tip, index) => (
            <Card key={tip.title} className="border-border">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getIconForTip(tip.title)}
                  <CardTitle className="font-serif text-xl">{tip.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tip.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="font-sans text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </main>
    </div>
  );
}