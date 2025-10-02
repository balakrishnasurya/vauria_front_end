export interface Founder {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  expertise: string[];
  experience: string;
  education: string;
  quote: string;
}

export const foundersData: Founder[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    title: "Co-Founder & Master Craftsman",
    description: "With over 20 years of experience in traditional jewelry making, Rajesh brings the ancient art of Indian craftsmanship to modern luxury jewelry. His expertise in working with precious metals and gemstones has earned recognition from jewelry connoisseurs worldwide.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    expertise: [
      "Traditional Indian Jewelry Making",
      "Gemstone Setting & Cutting",
      "Gold & Platinum Craftsmanship",
      "Antique Restoration"
    ],
    experience: "20+ years in luxury jewelry design",
    education: "Master's in Jewelry Design, National Institute of Design",
    quote: "Every piece of jewelry tells a story. Our role is to make that story as beautiful and eternal as the love it represents."
  },
  {
    id: "2",
    name: "Priya Sharma",
    title: "Co-Founder & Creative Director",
    description: "Priya combines her passion for contemporary design with a deep understanding of cultural heritage. Her vision has transformed Vauria into a brand that speaks to modern queens while honoring timeless traditions.",
    image: "https://images.unsplash.com/photo-1494790108755-2616c128c2e7?w=400&h=400&fit=crop&crop=face",
    expertise: [
      "Contemporary Jewelry Design",
      "Brand Strategy & Vision",
      "Customer Experience Design",
      "Luxury Market Analysis"
    ],
    experience: "15+ years in luxury fashion and jewelry",
    education: "MBA in Luxury Brand Management, Fashion Institute of Technology",
    quote: "Jewelry is not just an accessory; it's an expression of one's inner royalty. We craft pieces that help every woman embrace her queen."
  }
];

export const companyStory = {
  founding: "2019",
  mission: "To create exquisite jewelry that celebrates the royalty in every woman, combining traditional craftsmanship with contemporary elegance.",
  vision: "To be the most trusted name in luxury jewelry, known for our uncompromising quality, innovative designs, and exceptional customer experience.",
  values: [
    {
      title: "Craftsmanship Excellence",
      description: "Every piece is meticulously handcrafted by master artisans using time-honored techniques."
    },
    {
      title: "Authentic Materials",
      description: "We source only the finest precious metals and certified gemstones for our collections."
    },
    {
      title: "Cultural Heritage",
      description: "Our designs honor Indian jewelry traditions while embracing contemporary aesthetics."
    },
    {
      title: "Customer Royalty",
      description: "Every customer is treated like royalty, with personalized service and lifetime support."
    }
  ],
  achievements: [
    "500+ satisfied customers worldwide",
    "Featured in Vogue India & Harper's Bazaar",
    "Winner of Best New Jewelry Brand 2021",
    "Certified by Gemological Institute of America"
  ]
};