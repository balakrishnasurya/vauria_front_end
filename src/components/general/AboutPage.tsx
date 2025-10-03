import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Award, 
  Users, 
  Heart,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

import { Founder, companyStory as CompanyStoryType } from '../../data/about.data';
import { aboutService } from '@/services/about.service';
import { ABOUT_MESSAGES } from '../../constants/about.messages';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface AboutPageProps {
  onBackToHome: () => void;
  onProfileClick: () => void;
}

export function AboutPage({
  onBackToHome,
  onProfileClick
}: AboutPageProps) {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [companyStory, setCompanyStory] = useState<typeof CompanyStoryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAboutData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [foundersData, storyData] = await Promise.all([
          aboutService.getFounders(),
          aboutService.getCompanyStory()
        ]);

        setFounders(foundersData);
        setCompanyStory(storyData);
      } catch (err) {
        setError(ABOUT_MESSAGES.ERROR);
      } finally {
        setLoading(false);
      }
    };

    loadAboutData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"
          />
          <span className="font-serif text-lg text-foreground">{ABOUT_MESSAGES.LOADING}</span>
        </motion.div>
      </div>
    );
  }

  if (error || !companyStory) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-serif text-2xl">{error}</h2>
            <Button onClick={onBackToHome} variant="outline">
              {ABOUT_MESSAGES.BACK_TO_HOME}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-6">
        {/* Hero Section */}
        <motion.section 
          className="py-12 lg:py-20 px-4 lg:px-6 bg-gradient-to-r from-primary/10 to-accent/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Crown className="h-16 w-16 text-primary mx-auto mb-6" />
              <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-6">
                {ABOUT_MESSAGES.PAGE_TITLE}
              </h1>
              <p className="font-sans text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Crafting exquisite jewelry that celebrates the royalty in every woman, 
                combining traditional artistry with contemporary elegance.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Company Story */}
        <section className="py-16 lg:py-20 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-6">
                {ABOUT_MESSAGES.OUR_STORY}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-8">
                <Crown className="h-6 w-6 text-primary" />
                <span className="font-serif text-lg text-primary">
                  {ABOUT_MESSAGES.FOUNDED_IN} {companyStory.founding}
                </span>
                <Crown className="h-6 w-6 text-primary" />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Heart className="h-6 w-6 text-primary" />
                      <h3 className="font-serif text-2xl font-bold">{ABOUT_MESSAGES.MISSION}</h3>
                    </div>
                    <p className="font-sans text-muted-foreground leading-relaxed">
                      {companyStory.mission}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Star className="h-6 w-6 text-primary" />
                      <h3 className="font-serif text-2xl font-bold">{ABOUT_MESSAGES.VISION}</h3>
                    </div>
                    <p className="font-sans text-muted-foreground leading-relaxed">
                      {companyStory.vision}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Values */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-center mb-12">
                {ABOUT_MESSAGES.OUR_VALUES}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {companyStory.values.map((value: { title: string; description: string }, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full text-center hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Crown className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-serif text-lg font-bold mb-3">{value.title}</h4>
                        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                          {value.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-serif text-2xl lg:text-3xl font-bold text-center mb-12">
                {ABOUT_MESSAGES.ACHIEVEMENTS}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {companyStory.achievements.map((achievement: string, index: number) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-sans text-sm">{achievement}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="py-16 lg:py-20 px-4 lg:px-6 bg-muted/20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
                {ABOUT_MESSAGES.MEET_FOUNDERS}
              </h2>
              <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
                Meet the visionaries behind Vauria, combining decades of expertise 
                and passion for creating extraordinary jewelry.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {founders.map((founder, index) => (
                <motion.div
                  key={founder.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-500">
                    <CardContent className="p-0">
                      <div className="relative">
                        <div className="aspect-[4/3] overflow-hidden">
                          <ImageWithFallback
                            src={founder.image}
                            alt={founder.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4">
                            <h3 className="font-serif text-2xl font-bold mb-1">{founder.name}</h3>
                            <p className="font-sans text-primary font-medium">{founder.title}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 space-y-6">
                        <p className="font-sans text-muted-foreground leading-relaxed">
                          {founder.description}
                        </p>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-serif text-lg font-medium text-foreground mb-2">
                              {ABOUT_MESSAGES.EXPERIENCE}
                            </h4>
                            <p className="font-sans text-sm text-muted-foreground">
                              {founder.experience}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-serif text-lg font-medium text-foreground mb-2">
                              {ABOUT_MESSAGES.EDUCATION}
                            </h4>
                            <p className="font-sans text-sm text-muted-foreground">
                              {founder.education}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-serif text-lg font-medium text-foreground mb-3">
                              {ABOUT_MESSAGES.EXPERTISE}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {founder.expertise.map((skill, skillIndex) => (
                                <Badge 
                                  key={skillIndex} 
                                  variant="secondary"
                                  className="font-sans text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <blockquote className="font-serif text-lg italic text-foreground leading-relaxed">
                            "{founder.quote}"
                          </blockquote>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            onClick={onProfileClick}
                            variant="outline"
                            className="w-full font-sans"
                          >
                            {ABOUT_MESSAGES.VIEW_PROFILE}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <motion.section 
          className="py-16 lg:py-20 px-4 lg:px-6 bg-gradient-to-r from-primary/10 to-accent/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Crown className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
                Join the Royal Experience
              </h2>
              <p className="font-sans text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Discover our exquisite collection and become part of the Vauria family. 
                Every piece is crafted with love, precision, and the finest materials.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={onBackToHome}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-lg px-8 py-3 h-12 shadow-lg hover:shadow-xl transition-all"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Explore Collection
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}