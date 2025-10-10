'use client'

import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, RotateCcw, AlertTriangle, CreditCard, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FOOTER_DATA } from '@/data/footer.data';
import { useMainContext } from '@/context/MainContext';

export default function ReturnsPage() {
  const { handleLogoClick } = useMainContext();
  const returnsData = FOOTER_DATA.returns.content;

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
            {returnsData.title}
          </h1>
          <p className="font-sans text-lg text-muted-foreground mb-6">
            {returnsData.description}
          </p>
        </motion.div>

        {/* Eligibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-primary" />
                <CardTitle className="font-serif text-xl">{returnsData.eligibility.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {returnsData.eligibility.conditions.map((condition, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="font-sans text-muted-foreground">{condition}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Return Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-6 w-6 text-primary" />
                <CardTitle className="font-serif text-xl">{returnsData.process.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {returnsData.process.steps.map((step, index) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {step.step}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-sans font-medium mb-1">{step.title}</h4>
                      <p className="font-sans text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Damaged Items */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-primary" />
                <CardTitle className="font-serif text-xl">{returnsData.damagedItems.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-sans text-muted-foreground">{returnsData.damagedItems.content}</p>
            </CardContent>
          </Card>

          {/* Refund Method */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <CardTitle className="font-serif text-xl">{returnsData.refundMethod.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-sans text-muted-foreground">{returnsData.refundMethod.content}</p>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <HelpCircle className="h-6 w-6 text-primary" />
                <CardTitle className="font-serif text-xl">{returnsData.support.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-sans text-muted-foreground mb-4">{returnsData.support.content}</p>
              <div className="space-y-2">
                {returnsData.support.contacts.map((contact, index) => (
                  <p key={index} className="font-sans text-sm text-muted-foreground">{contact}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}