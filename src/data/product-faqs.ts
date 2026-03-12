interface Faq {
  question: string;
  answer: string;
}

/** Product-slug → FAQs for SEO-rich FAQ schema and display. */
export const PRODUCT_FAQS: Record<string, Faq[]> = {
  mounjaro: [
    {
      question: "What is Mounjaro and how does it work?",
      answer:
        "Mounjaro (tirzepatide) is a prescription weight loss injection that works by mimicking two gut hormones — GLP-1 and GIP. It reduces appetite, slows gastric emptying, and helps regulate blood sugar levels, leading to significant weight loss when combined with a reduced-calorie diet and exercise.",
    },
    {
      question: "Do I need a prescription to buy Mounjaro in the UK?",
      answer:
        "Yes. Mounjaro is a prescription-only medicine (POM) in the UK. At Roots Pharmacy you complete a free online consultation reviewed by a qualified prescriber. If clinically appropriate, they will issue a prescription and your treatment is dispatched directly to you.",
    },
    {
      question: "How much weight can I lose on Mounjaro?",
      answer:
        "Clinical trials (SURMOUNT-1) showed patients lost an average of 15-22% of their body weight over 72 weeks, depending on the dose. Individual results vary based on starting weight, adherence, diet, and exercise.",
    },
    {
      question: "What are the common side effects of Mounjaro?",
      answer:
        "The most common side effects are nausea, diarrhoea, decreased appetite, vomiting, and constipation. These are usually mild, occur when starting or increasing the dose, and tend to improve over time.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Once your consultation is approved and payment is captured, we aim to dispatch within 1 business day. Standard Royal Mail Tracked 48 delivery takes 2-3 working days.",
    },
    {
      question: "Can I use Mounjaro if I have type 2 diabetes?",
      answer:
        "Mounjaro is also licensed for type 2 diabetes. However, your prescriber will need to review your full medical history during the consultation to ensure it is safe alongside your existing diabetes medications.",
    },
  ],

  "centrum-advance-multivitamin": [
    {
      question: "What does Centrum Advance contain?",
      answer:
        "Centrum Advance is a complete A-Z multivitamin with 24 key nutrients including vitamins A, C, D, E, K, all B vitamins, and essential minerals such as zinc, iron, and selenium.",
    },
    {
      question: "Who should take Centrum Advance?",
      answer:
        "Centrum Advance is designed for adults who want to support their overall daily nutrition. It's suitable for most adults as a daily supplement alongside a balanced diet.",
    },
  ],

  "centrum-advance-50-plus": [
    {
      question: "How is Centrum 50+ different from regular Centrum?",
      answer:
        "Centrum Advance 50+ is specifically formulated for adults over 50, with adjusted levels of key nutrients like vitamin D, B12, and calcium to support bone health, energy, and immunity as nutritional needs change with age.",
    },
  ],

  "gaviscon-double-action": [
    {
      question: "How quickly does Gaviscon Double Action work?",
      answer:
        "Gaviscon Double Action starts to work within minutes. It neutralises excess stomach acid and forms a protective raft on top of stomach contents to prevent acid reflux.",
    },
    {
      question: "Can I take Gaviscon every day?",
      answer:
        "Gaviscon can be taken as needed after meals and before bed. If you find you need it daily for more than 2 weeks, consult your pharmacist or GP to investigate the underlying cause.",
    },
  ],

  "kalms-day": [
    {
      question: "Is Kalms Day a sedative?",
      answer:
        "No. Kalms Day is a traditional herbal remedy containing Valerian root that helps relieve symptoms of mild anxiety and irritability without causing drowsiness, making it suitable for daytime use.",
    },
    {
      question: "How long does it take for Kalms Day to work?",
      answer:
        "Herbal remedies may take several days of consistent use before you notice the full benefit. Take as directed and allow at least 2 weeks for the effects to build.",
    },
  ],

  "kalms-night": [
    {
      question: "Will Kalms Night make me drowsy the next day?",
      answer:
        "Kalms Night is designed to promote natural sleep without causing a morning hangover effect. It contains a higher dose of Valerian to help you drift off naturally.",
    },
  ],

  "nytol-herbal": [
    {
      question: "Is Nytol Herbal addictive?",
      answer:
        "No. Nytol Herbal contains natural Hops and Valerian extracts and is non-addictive. It is suitable for short-term relief of temporary sleep disturbances.",
    },
  ],

  "berocca-orange": [
    {
      question: "When is the best time to take Berocca?",
      answer:
        "Most people take Berocca first thing in the morning dissolved in a glass of water. The B vitamins and vitamin C support energy release throughout the day.",
    },
  ],

  "acnecide-5-gel": [
    {
      question: "How long does Acnecide take to work?",
      answer:
        "You may see improvement within 1-2 weeks, but it can take 4-6 weeks for the full effect. Benzoyl peroxide works by killing acne-causing bacteria and unclogging pores.",
    },
    {
      question: "Can I use Acnecide with other skincare products?",
      answer:
        "Avoid using other strong active ingredients (salicylic acid, retinoids) at the same time as Acnecide to prevent excessive dryness. Use a gentle moisturiser and SPF during the day as benzoyl peroxide can increase sun sensitivity.",
    },
  ],

  "freederm-treatment-gel": [
    {
      question: "Is Freederm suitable for sensitive skin?",
      answer:
        "Yes. Freederm contains nicotinamide (vitamin B3), which is gentle on skin. It's fragrance-free and designed to treat mild to moderate acne without harsh drying effects.",
    },
  ],

  "imodium-instants": [
    {
      question: "How quickly do Imodium Instants work?",
      answer:
        "Imodium Instants dissolve on the tongue within seconds and typically start to relieve diarrhoea symptoms within 1 hour. They contain loperamide which slows down bowel movement.",
    },
  ],

  "seven-seas-jointcare-essential": [
    {
      question: "What is in Seven Seas JointCare Essential?",
      answer:
        "JointCare Essential contains glucosamine and omega-3 fish oils to support joint flexibility and mobility. Glucosamine is a building block of cartilage, while omega-3s have anti-inflammatory properties.",
    },
  ],

  "seven-seas-jointcare-turmeric-duo-pack": [
    {
      question: "Why does JointCare + Turmeric come as a duo pack?",
      answer:
        "The duo pack provides two complementary supplements: one capsule with glucosamine and omega-3 for joint health, and a second with turmeric extract (curcumin) for its natural anti-inflammatory benefits.",
    },
  ],

  "valupak-glucosamine-sulphate-500mg": [
    {
      question: "What is glucosamine sulphate used for?",
      answer:
        "Glucosamine sulphate is commonly taken to support joint health and comfort. It's a natural compound found in cartilage and is one of the most widely used joint supplements in the UK.",
    },
  ],

  "osteocare-original": [
    {
      question: "Who should take Osteocare?",
      answer:
        "Osteocare is suitable for anyone looking to support bone health. It contains calcium, vitamin D, magnesium, and zinc — key nutrients for maintaining normal bones. It's particularly popular with women and older adults.",
    },
  ],
};
