"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMyMixes, deleteMix } from "@/app/lib/mixesClient";
import { Trash2 } from "lucide-react";
import type { MixerState } from "@/types/audio";

interface SavedMixesCardProps {
  onLoadMix: (settings: MixerState) => void;
}

export function SavedMixesCard({ onLoadMix }: SavedMixesCardProps) {
  const [mixes, setMixes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMixes();
  }, []);

  async function loadMixes() {
    try {
      setLoading(true);
      const data = await getMyMixes();
      setMixes(data);
    } catch (err) {
      console.error("Failed to load mixes:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this saved mix?")) return;
    try {
      await deleteMix(id);
      await loadMixes();
    } catch (err) {
      console.error("Failed to delete mix:", err);
      alert("Failed to delete mix");
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Saved Mixes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (mixes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Saved Mixes</CardTitle>
          <CardDescription>Save your mix configurations to load them later</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No saved mixes yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Saved Mixes</CardTitle>
        <CardDescription>Load a previously saved mix configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {mixes.map((mix) => (
          <div
            key={mix.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex-1">
              <p className="font-medium">{mix.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(mix.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLoadMix(mix.settings)}
              >
                Load
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(mix.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

