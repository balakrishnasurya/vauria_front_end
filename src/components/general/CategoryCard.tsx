import { motion } from 'motion/react';
import { Card, CardContent } from "@/components/ui/card";
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Category } from '@/models/interfaces/categories.interface';

interface CategoryCardProps {
  category: Category;
  onClick: (categorySlug: string) => void;
  index?: number;
  className?: string;
}

export function CategoryCard({ category, onClick, index = 0, className = "" }: CategoryCardProps) {
  const handleCardClick = () => {
    onClick(category.slug);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      onClick={handleCardClick}
      className={`cursor-pointer ${className}`}
    >
      <Card className="group cursor-pointer border-border hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden hover:border-primary/20">
        <CardContent className="p-0">
          <div className="aspect-square relative overflow-hidden rounded-t-lg">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <ImageWithFallback
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            
            {/* Subtle hover indicator */}
            <motion.div 
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                Explore
              </div>
            </motion.div>
          </div>
          
          {/* Category Information */}
          <motion.div 
            className="p-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.h3 
              className="font-serif font-medium text-foreground group-hover:text-primary transition-colors mb-2"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {category.name}
            </motion.h3>
            
            <motion.p 
              className="font-sans text-muted-foreground text-sm leading-relaxed line-clamp-2 group-hover:text-muted-foreground/80 transition-colors"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {category.description}
            </motion.p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}