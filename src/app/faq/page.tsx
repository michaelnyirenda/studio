
// src/app/faq/page.tsx
"use client";

import PageHeader from "@/components/shared/page-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const faqs = [
    {
        question: "What is #iBreakFree?",
        answer: "#iBreakFree is an integrated, confidential platform designed to empower you with health education, community engagement, and direct access to health services. Our features include a community forum, confidential health screenings (HIV, GBV, PrEP, STI), a referral system to connect you with care, and an anonymous chat with support staff."
    },
    {
        question: "How do I use the Community Forum?",
        answer: "To visit the forum, click the 'Forum' icon in the navigation bar. You can browse and read any post."
    },
    {
        question: "How do I take a screening?",
        answer: "1. Navigate to the 'Screening' page from the main navigation bar.\n2. Select the type of screening you'd like to take (e.g., HIV, PrEP).\n3. Answer the questions honestly. Your answers are confidential.\n4. After submitting, you will receive a recommendation based on your answers. If a referral is recommended, it will be generated for you."
    },
    {
        question: "How do I complete a referral?",
        answer: "If a screening generates a referral, you will be directed to the 'Referrals' page. You can also get there by clicking the 'Referrals' icon in the navigation bar.\n1. A card will appear asking for your consent.\n2. You must check the consent box to proceed.\n3. Select your region, constituency, and a specific health facility from the dropdown menus.\n4. Choose your preferred contact method.\n5. Click 'Confirm Referral'. Our support team will then be notified and will contact you."
    },
    {
        question: "How do I find a referral I completed in the past?",
        answer: "On the 'Referrals' page, there is a search box. Enter the unique Referral ID you received when you first created the referral and click 'Find Referral'. The details of that referral will appear, allowing you to download the PDF again."
    },
    {
        question: "How does the confidential chat work?",
        answer: "Go to the 'Chat' page from the navigation bar. Click 'Start Anonymous Chat' to be connected with a support staff member. Your identity remains anonymous. When you're finished, you can click the 'Close Chat' button to end the session."
    },
    {
        question: "Is my data secure?",
        answer: "Yes. We are committed to protecting your privacy. All screenings and chats are confidential. Personal information is handled securely and is only used to provide you with the services you request, such as generating a referral for a healthcare provider."
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
                                <AccordionContent className="text-base text-muted-foreground pt-2 whitespace-pre-line">
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
