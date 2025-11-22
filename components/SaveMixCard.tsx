"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { saveMix } from "@/app/lib/mixesClient";
import type { MixerState } from "@/types/audio";

interface SaveMixCardProps {
  state: MixerState;
}

export function SaveMixCard({ state }: SaveMixCardProps) {
  const [mixName, setMixName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!mixName.trim()) {
      alert("Please enter a name for your mix");
      return;
    }

    try {
      setSaving(true);
      await saveMix(mixName.trim(), state);
      setMixName("");
      alert("Mix saved successfully!");
    } catch (err: any) {
      console.error("Failed to save mix:", err);
      if (err.message === "Not logged in") {
        alert("Please log in to save mixes");
      } else {
        alert("Failed to save mix");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Save Mix</CardTitle>
        <CardDescription>Save your current mix configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mix-name">Mix Name</Label>
          <input
            id="mix-name"
            type="text"
            placeholder="My Mix #1"
            value={mixName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMixName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleSave();
              }
            }}
            className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !mixName.trim()}
          className="w-full"
        >
          {saving ? "Saving..." : "Save Mix"}
        </Button>
      </CardContent>
    </Card>
  );
}

