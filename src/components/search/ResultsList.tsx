import JobCard from "./JobCard";
import CandidateCard from "./CandidateCard";
import type { UserRole } from "@/contexts/AuthContext";

interface ResultsListProps {
  results: any[];
  role: UserRole | undefined;
}

export default function ResultsList({ results, role }: ResultsListProps) {
  return (
    <div className="grid gap-6">
      {results.map((item, index) => (
        <div 
          key={item.id} 
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms`}}
        >
          {role === 'seeker' ? <JobCard job={item} /> : <CandidateCard candidate={item} />}
        </div>
      ))}
    </div>
  );
}
