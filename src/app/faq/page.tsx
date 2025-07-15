// src/app/faq/page.tsx
"use client";

import PageHeader from "@/components/shared/page-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
    {
        question: "What is #iBreakFree?",
        answer: "#iBreakFree is an integrated platform designed to provide education, community engagement, and health awareness. Our goal is to empower users with information and confidential access to health services."
    },
    {
        question: "How does the Community Forum work?",
        answer: "The forum is a space for users to browse discussions, share insights, and connect with others. You can read posts from the community and our admin team. Admins can create new posts to share important information."
    },
    {
        question: "What are Screenings?",
        answer: "Our confidential screening tools (HIV, GBV, PrEP, STI) help you assess your health risks. Based on your answers, the system provides guidance and can generate a referral for professional health services if needed."
    },
    {
        question: "How do Referrals work?",
        answer: "If a screening indicates that you might benefit from professional support, a referral is generated. You can find this referral in the 'Referrals' section. You must provide consent and choose a health facility before the referral is sent to our support team."
    },
    {
        question: "Is the Chat feature confidential?",
        answer: "Yes. The chat feature allows you to speak with our support staff anonymously. Your privacy is a top priority, and conversations are handled with the utmost confidentiality."
    },
    {
        question: "How is my data protected?",
        answer: "We are committed to protecting your privacy. All screenings and chats are confidential. Personal information is handled securely and is only used to provide you with the services you request, such as generating a referral."
    }
];

export default function FaqPage() {
    return (
        <div className="container mx-auto py-8 px-4 pb-24">
            <PageHeader
                title="Frequently Asked Questions"
                description="Find answers to common questions about using the #iBreakFree platform."
            />

            <Card className="w-full max-w-3xl mx-auto shadow-xl">
                <CardContent className="p-6">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-lg font-semibold text-left hover:no-underline">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground pt-2">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
