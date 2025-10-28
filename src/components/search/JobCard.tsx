import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

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
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {job.description}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{timeAgo}</span>
          </div>
        </div>
        <Button className="rounded-full w-full sm:w-auto font-bold px-6 py-3">
            {t('jobCard.applyNow')}
        </Button>
      </CardFooter>
    </Card>
  );
}
