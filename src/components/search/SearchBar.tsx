
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

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
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
    <Card className="rounded-2xl shadow-lg overflow-hidden">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2 grid gap-2">
              <Label htmlFor="q">المسمى الوظيفي أو الكلمة الرئيسية</Label>
              <Input
                id="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="مثال: مهندس برمجيات"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="loc">الموقع</Label>
              <Input
                id="loc"
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                placeholder="مثال: الرياض"
              />
            </div>
            <Button type="submit" className="w-full rounded-2xl h-10" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 ms-2" />
                  <span>بحث</span>
                </>
              )}
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="type" className="whitespace-nowrap">نوع التوظيف</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type" className="w-[150px] rounded-2xl">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="full-time">دوام كامل</SelectItem>
                  <SelectItem value="part-time">دوام جزئي</SelectItem>
                  <SelectItem value="contract">عقد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="remote-only" checked={remote} onCheckedChange={setRemote} />
              <Label htmlFor="remote-only">عن بعد فقط</Label>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
