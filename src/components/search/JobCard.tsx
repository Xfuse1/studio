
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
import { MapPin, Clock } from "lucide-react";
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
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
            <DialogDescription>
              {job.company} - {job.location}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-base text-foreground max-h-[60vh] overflow-y-auto">
            <p>{job.description}</p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="secondary" 
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
