
'use client';

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase, Star, DollarSign, CheckCircle } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    postedAt: string;
    logo: string;
  };
}

const DetailSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-primary">
            {icon}
            {title}
        </h3>
        <div className="prose prose-sm text-foreground max-w-none">{children}</div>
    </div>
);

export default function JobCard({ job }: JobCardProps) {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const logoPlaceholder = PlaceHolderImages.find(p => p.id === job.logo);

  let timeAgo = 'undefined';
  try {
    if (job.postedAt) {
      timeAgo = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true, locale: i18n.language === 'ar' ? ar : enUS });
    }
  } catch (error) {
    console.error("Invalid date for job.postedAt:", job.postedAt);
  }
  
  const renderDescription = () => {
    if (!job.description) return <p>{t('jobCard.noDetails')}</p>;

    const sections: { [key: string]: { title: string; icon: React.ReactNode, content: string[] } } = {
        'المهام والمسؤوليات': { title: t('jobCard.responsibilities'), icon: <Briefcase className="w-5 h-5"/>, content: [] },
        'المؤهلات والخبرات': { title: t('jobCard.qualifications'), icon: <Star className="w-5 h-5"/>, content: [] },
        'الراتب والمميزات': { title: t('jobCard.benefits'), icon: <DollarSign className="w-5 h-5"/>, content: [] },
    };

    let currentSection: string | null = null;
    let otherContent: string[] = [];

    job.description.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        const foundSection = Object.keys(sections).find(key => trimmedLine.startsWith(key));
        
        if (foundSection) {
            currentSection = foundSection;
        } else if (currentSection && (trimmedLine.startsWith('-') || trimmedLine.startsWith('*'))) {
            sections[currentSection].content.push(trimmedLine.substring(1).trim());
        } else {
            otherContent.push(trimmedLine);
        }
    });

    const hasStructuredContent = Object.values(sections).some(s => s.content.length > 0);

    return (
        <div>
            {hasStructuredContent ? (
                <>
                    {otherContent.length > 0 && (
                        <p className="mb-4">{otherContent.join('\n')}</p>
                    )}
                    {Object.values(sections).map((section, index) => (
                        section.content.length > 0 && (
                            <DetailSection key={index} title={section.title} icon={section.icon}>
                                <ul className="list-none p-0 m-0">
                                    {section.content.map((item, itemIndex) => (
                                        <li key={itemIndex} className="flex items-start gap-2 mb-2">
                                            <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </DetailSection>
                        )
                    ))}
                </>
            ) : (
                <p>{job.description}</p>
            )}
        </div>
    );
};


  return (
    <>
      <Card className="w-full rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white">
        <CardHeader className="flex flex-row items-start gap-4">
          {logoPlaceholder ? (
              <div className="relative w-16 h-16">
                <Image
                    src={logoPlaceholder.imageUrl}
                    alt={`${job.company} logo`}
                    fill
                    className="rounded-xl border object-cover"
                    data-ai-hint={logoPlaceholder.imageHint}
                />
              </div>
          ) : (
            <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-xs">
              No Logo
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-xl font-headline">{job.title}</CardTitle>
            <CardDescription className="text-md">{job.company}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground text-base line-clamp-2">
            {job.description}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>
          <Button 
            className="rounded-full w-full sm:w-auto font-bold px-6 py-3"
            onClick={() => setIsDialogOpen(true)}
          >
              {t('jobCard.viewMore')}
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px] rounded-3xl">
          <DialogHeader className="pr-10">
            <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
            <DialogDescription>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.company}</span>
                </div>
                 <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-base text-foreground max-h-[60vh] overflow-y-auto custom-scrollbar pr-4">
             {renderDescription()}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="rounded-2xl"
            >
              {t('signIn.cancel')}
            </Button>
            <Button 
              type="button"
              className="rounded-2xl"
            >
              {t('jobCard.applyNow')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
