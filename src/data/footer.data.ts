export const FOOTER_DATA = {
  contact: {
    title: "Contact Us",
    phone: "+91 78423 51757",
    email: "vauria2025@gmail.com",
    instagram: "@vauriaofficial",
    content: {
      title: "Contact Us",
      description: "Get in touch with our customer support team. We're here to help you with any questions or concerns.",
      methods: [
        {
          type: "Phone",
          value: "+91 78423 51757",
          description: "Call us during business hours for immediate assistance"
        },
        {
          type: "Email",
          value: "vauria2025@gmail.com",
          description: "Send us an email and we'll respond within 24 hours"
        },
        {
          type: "Instagram DM",
          value: "@vauriaofficial",
          description: "Message us on Instagram for quick support"
        }
      ],
      businessHours: {
        weekdays: "Monday - Friday: 9:00 AM - 6:00 PM IST",
        weekends: "Saturday - Sunday: 10:00 AM - 4:00 PM IST"
      }
    }
  },

  careInstructions: {
    title: "Care Instructions",
    content: {
      title: "Jewelry Care Instructions",
      description: "To preserve the beauty and longevity of your jewellery, we recommend handling each piece with care.",
      mainText: "To preserve the beauty and longevity of your jewellery, we recommend handling each piece with care. Avoid direct contact with water, perfumes, lotions, and other harsh chemicals that may cause tarnishing or discoloration. Always store your jewellery in a dry, soft-lined box or pouch, preferably separate from other pieces to prevent scratches. Remove your jewellery before sleeping, swimming, or exercising. For cleaning, gently wipe with a soft, lint-free cloth, avoid abrasive materials. With proper care, your jewellery will continue to shine and be cherished for years to come.",
      tips: [
        {
          title: "Daily Care",
          items: [
            "Avoid direct contact with water, perfumes, lotions, and harsh chemicals",
            "Remove jewelry before sleeping, swimming, or exercising",
            "Put on jewelry last when getting dressed and remove first when undressing"
          ]
        },
        {
          title: "Storage",
          items: [
            "Store in a dry, soft-lined box or pouch",
            "Keep pieces separate to prevent scratches",
            "Use anti-tarnish strips in storage containers",
            "Avoid storing in humid areas like bathrooms"
          ]
        },
        {
          title: "Cleaning",
          items: [
            "Gently wipe with a soft, lint-free cloth",
            "Avoid abrasive materials or harsh chemicals",
            "For deeper cleaning, use jewelry-specific cleaners",
            "Professional cleaning recommended for valuable pieces"
          ]
        }
      ]
    }
  },

  shipping: {
    title: "Shipping Information",
    content: {
      title: "Shipping Information",
      description: "We aim to make your shopping experience seamless and secure.",
      overview: "We aim to make your shopping experience seamless and secure. Once your order is placed, you will receive a confirmation email followed by a tracking number once your jewellery is shipped.",
      sections: [
        {
          title: "Processing Time",
          content: "All orders are carefully packaged and shipped within 1–3 business days (excluding weekends and holidays)."
        },
        {
          title: "Delivery Options",
          content: "Standard Shipping: 5–7 business days\n\nShipping times are estimates and may vary during peak seasons or due to carrier delays."
        },
        {
          title: "Order Tracking",
          content: "Once your order ships, you'll receive a confirmation email with a tracking number. You can track your package at any time using the link provided."
        },
        {
          title: "Shipping Charges",
          content: "Shipping fees are calculated at checkout based on your delivery location and chosen shipping method.\n\nFree Standard Shipping on orders above ₹599"
        },
        {
          title: "Lost or Delayed Packages",
          content: "If your package is delayed or missing, please contact us at vauria2025@gmail.com with your order number. We'll do our best to assist you promptly."
        },
        {
          title: "Packaging",
          content: "Each piece of jewellery is securely packaged in a box, perfect for gifting and ensuring safe delivery."
        }
      ]
    }
  },

  returns: {
    title: "Returns & Exchanges",
    content: {
      title: "Returns & Exchanges",
      description: "Each piece of jewellery is handcrafted with care and undergoes strict quality checks before shipping. However, if you're not fully satisfied with your purchase, we're here to help.",
      eligibility: {
        title: "Eligibility",
        conditions: [
          "The item is unused, unworn, and in its original packaging",
          "A return request is made within 7 days of receiving your order"
        ]
      },
      process: {
        title: "Return Process",
        steps: [
          {
            step: 1,
            title: "Contact Us",
            description: "Email us at vauria2025@gmail.com with your order number and reason for return."
          },
          {
            step: 2,
            title: "Approval",
            description: "Once your return is approved, you'll receive instructions and a return shipping address."
          },
          {
            step: 3,
            title: "Ship Back",
            description: "Please ensure the jewellery is securely packaged."
          },
          {
            step: 4,
            title: "Refund or Exchange",
            description: "Once we receive and inspect the item, we'll process your refund or exchange within 5–7 business days."
          }
        ]
      },
      damagedItems: {
        title: "Damaged or Incorrect Items",
        content: "If you receive a damaged or wrong item, please contact us within 48 hours of delivery with photos. We'll replace it or issue a full refund at no additional cost."
      },
      refundMethod: {
        title: "Refund Method",
        content: "Refunds will be issued to your original payment method. Depending on your bank, it may take up to 7–10 business days for the amount to reflect."
      },
      support: {
        title: "Need Help?",
        content: "Our support team is always happy to assist!",
        contacts: [
          "📩 Email: vauria2025@gmail.com",
          "💬 Instagram DM: @vauriaofficial"
        ]
      }
    }
  }
};

export const FOOTER_NAVIGATION = {
  shop: [
    { name: "Casual Chains", href: "/casual-chains" },
    { name: "Necklaces", href: "/necklaces" },
    { name: "Earrings", href: "/earrings" },
    { name: "Bracelets", href: "/bracelets" },
    { name: "Traditional Chains", href: "/traditional-chains" }
  ],
  customerCare: [
    { name: "Contact Us", href: "/contact" },
    { name: "Care Instructions", href: "/care-instructions" },
    { name: "Shipping Info", href: "/shipping" },
    { name: "Returns & Exchanges", href: "/returns" }
    // Commented out as requested:
    // { name: "Size Guide", href: "/size-guide" },
    // { name: "FAQ", href: "/faq" }
  ]
  // Commented out sections as requested:
  /*
  aboutVauria: [
    { name: "Our Story", href: "/about" },
    { name: "Craftsmanship", href: "/craftsmanship" },
    { name: "Sustainability", href: "/sustainability" },
    { name: "Press", href: "/press" },
    { name: "Careers", href: "/careers" },
    { name: "Blog", href: "/blog" }
  ]
  */
};