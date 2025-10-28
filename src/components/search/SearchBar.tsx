
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import type { SearchParams } from "@/app/search/page";
import { Loader2, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [type, setType] = useState("all");
  const [remote, setRemote] = useState(false);

  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setLoc(searchParams.get('loc') || '');
    setType(searchParams.get('type') || 'all');
    setRemote(searchParams.get('remote') === 'true');
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ q, loc, type, remote });
  };

  return (
    <Card className="rounded-3xl shadow-lg overflow-hidden border-0 bg-white/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <Input
              id="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('search.jobTitlePlaceholder')}
              className="rounded-full h-14 px-6 text-lg"
            />
            <Input
              id="loc"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              placeholder={t('search.locationPlaceholder')}
              className="rounded-full h-14 px-6 text-lg"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="type" className="whitespace-nowrap font-medium">{t('search.employmentType')}</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" className="w-auto rounded-full border-2 bg-white font-medium">
                  <SelectValue placeholder={t('search.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('search.all')}</SelectItem>
                  <SelectItem value="full-time">{t('search.fullTime')}</SelectItem>
                  <SelectItem value="part-time">{t('search.partTime')}</SelectItem>
                  <SelectItem value="contract">{t('search.contract')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2" dir="ltr">
              <Label htmlFor="remote-only" className="font-medium cursor-pointer">{t('search.remoteOnly')}</Label>
              <Switch id="remote-only" checked={remote} onCheckedChange={setRemote} />
            </div>
          </div>
          <Button type="submit" className="w-full rounded-full h-14 text-xl font-bold" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Search className="h-6 w-6 ms-2" />
                <span>{t('search.search')}</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
