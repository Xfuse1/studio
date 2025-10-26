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
import { ar } from 'date-fns/locale';

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
  const logoPlaceholder = PlaceHolderImages.find(p => p.id === job.logo);

  const timeAgo = formatDistanceToNow(new Date(job.postedAt), { addSuffix: true, locale: ar });

  return (
    <Card className="w-full rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-4">
        {logoPlaceholder && (
            <Image
                src={logoPlaceholder.imageUrl}
                alt={`${job.company} logo`}
                width={64}
                height={64}
                className="rounded-lg border"
                data-ai-hint={logoPlaceholder.imageHint}
            />
        )}
        <div className="flex-1">
          <CardTitle className="text-xl font-headline">{job.title}</CardTitle>
          <CardDescription className="text-md">{job.company}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2">
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
        <Button className="rounded-2xl w-full sm:w-auto">التقديم الآن</Button>
      </CardFooter>
    </Card>
  );
}
