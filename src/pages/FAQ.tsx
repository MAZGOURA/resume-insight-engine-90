import { Header } from "@/components/Header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      category: "Shipping",
      questions: [
        {
          q: "What are the shipping costs?",
          a: "We offer free shipping on all orders with a flat $15 delivery fee for cash on delivery orders."
        },
        {
          q: "How long does delivery take?",
          a: "Standard delivery takes 3-5 business days. Express delivery is available for an additional fee."
        }
      ]
    },
    {
      category: "Returns",
      questions: [
        {
          q: "What is your return policy?",
          a: "We accept returns within 30 days of delivery for unopened products in their original packaging."
        },
        {
          q: "How do I return an item?",
          a: "Contact our customer service team to initiate a return. We'll provide you with a return label and instructions."
        }
      ]
    },
    {
      category: "Products",
      questions: [
        {
          q: "Are your perfumes authentic?",
          a: "Yes, all our perfumes are 100% authentic and sourced directly from authorized distributors."
        },
        {
          q: "How should I store my perfume?",
          a: "Store perfumes in a cool, dry place away from direct sunlight to maintain their quality."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">
            Frequently Asked Questions
          </h1>
          
          <div className="space-y-8">
            {faqs.map((category, idx) => (
              <div key={idx}>
                <h2 className="font-serif text-2xl font-bold mb-4">{category.category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, qIdx) => (
                    <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                      <AccordionTrigger>{item.q}</AccordionTrigger>
                      <AccordionContent>{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
