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
import { MapPin, Mail, Phone } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface CandidateCardProps {
  candidate: {
    id: string;
    name: string;
    title: string;
    location: string;
    skills: string[];
    summary: string;
    avatar: string;
    email?: string;
    phone?: string;
    nationality?: string;
    skillsWithLevel?: any[];
  };
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const router = useRouter();
    const avatarPlaceholder = PlaceHolderImages.find(p => p.id === candidate.avatar);

    const displaySkills = candidate.skills || 
                         (candidate.skillsWithLevel?.map((s: any) => s.name) || []);

    const handleViewProfile = () => {
      if(!user) {
        router.push('/signin');
      } else {
        console.log("Navigate to profile for user:", candidate.id);
      }
    }

  return (
    <Card className="w-full rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white">
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
      <CardContent className="grid gap-4">
        <p className="text-foreground text-base line-clamp-2">
          {candidate.summary}
        </p>
        
        <div className="flex flex-col gap-2">
            <h3 className="text-base font-semibold">{t('candidateCard.skills')}</h3>
            <div className="flex flex-wrap gap-2">
              {displaySkills && displaySkills.length > 0 ? (
                displaySkills.map((skill, index) => (
                  <Badge key={skill || index} variant="secondary" className="rounded-full px-3 py-1 text-base">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">لا توجد مهارات</span>
              )}
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
            {candidate.email && 
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{candidate.email}</span>
                </div>
            }
            {candidate.phone && 
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{candidate.phone}</span>
                </div>
            }
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{candidate.location}</span>
          </div>
        <Button variant="outline" className="rounded-full font-bold px-6 py-3 border-primary text-primary hover:bg-primary/10 hover:text-primary" onClick={handleViewProfile}>
          {t('candidateCard.viewProfile')}
        </Button>
      </CardFooter>
    </Card>
  );
}
