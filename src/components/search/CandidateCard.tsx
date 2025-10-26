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
import { MapPin } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    title: string;
    location: string;
    skills: string[];
    summary: string;
    avatar: string;
  };
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
    const avatarPlaceholder = PlaceHolderImages.find(p => p.id === candidate.avatar);

  return (
    <Card className="w-full rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-4">
        {avatarPlaceholder && (
            <Image
                src={avatarPlaceholder.imageUrl}
                alt={`${candidate.name} avatar`}
                width={64}
                height={64}
                className="rounded-full border"
                data-ai-hint={avatarPlaceholder.imageHint}
            />
        )}
        <div className="flex-1">
          <CardTitle className="text-xl font-headline">{candidate.name}</CardTitle>
          <CardDescription className="text-md text-primary">{candidate.title}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {candidate.summary}
        </p>
        <div className="flex flex-wrap gap-2">
            <span className="font-medium">المهارات:</span>
            {candidate.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="rounded-lg">{skill}</Badge>
            ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{candidate.location}</span>
          </div>
        <Button variant="outline" className="rounded-2xl w-full sm:w-auto">عرض الملف الشخصي</Button>
      </CardFooter>
    </Card>
  );
}
