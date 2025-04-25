
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { WeeklyContent as WeeklyContentType } from '@/services/education';

interface WeeklyContentProps {
  weeklyContent: WeeklyContentType[];
}

const WeeklyContent = ({ weeklyContent }: WeeklyContentProps) => {
  if (!weeklyContent.length) return null;
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-medium mb-4">Course Content</h2>
      <Accordion type="single" collapsible className="w-full">
        {weeklyContent.map((week, index) => (
          <AccordionItem key={index} value={`week-${index}`}>
            <AccordionTrigger className="text-left">{week.title}</AccordionTrigger>
            <AccordionContent>
              <p className="text-gray-700">{week.content}</p>
              <Button className="mt-4 bg-emerge-gold hover:bg-emerge-gold/90">Access Materials</Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default WeeklyContent;
