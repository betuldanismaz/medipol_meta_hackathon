"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import DemoDataBadge from "@/components/matchfluence/DemoDataBadge";
import { sampleCampaign } from "@/data/matchfluenceInfluencers";
import { Button } from "@/components/ui/button";
import type { CampaignInput } from "@/types";

const nicheOptions = [
  "kahve",
  "lokal mekan",
  "lifestyle",
  "yemek",
  "moda",
  "beauty",
  "fitness",
  "teknoloji",
  "vegan",
  "anne-cocuk",
] as const;

type CampaignFormProps = {
  campaign: CampaignInput;
  isMock: boolean;
  setCampaign: Dispatch<SetStateAction<CampaignInput>>;
  onAnalyze: () => void;
};

export default function CampaignForm({
  campaign,
  isMock,
  setCampaign,
  onAnalyze,
}: CampaignFormProps) {
  const updateField = <K extends keyof CampaignInput>(field: K, value: CampaignInput[K]) => {
    setCampaign((prev) => ({ ...prev, [field]: value }));
  };

  const toggleNiche = (niche: string) => {
    setCampaign((prev) => {
      const exists = prev.preferredNiches.includes(niche);
      return {
        ...prev,
        preferredNiches: exists
          ? prev.preferredNiches.filter((item) => item !== niche)
          : [...prev.preferredNiches, niche],
      };
    });
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <DemoDataBadge isMock={isMock} />
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Kampanya oluştur</h1>
          <p className="mt-2 text-muted-foreground">
            Bilgileri doldur, AI en uygun influencer adaylarını sıralasın.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setCampaign(sampleCampaign)}
        >
          Örnek kampanya yükle
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm space-y-6">
        <FormSection title="İşletme Bilgisi">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="İşletme adı">
              <input
                value={campaign.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                className="form-input"
              />
            </Field>
            <Field label="Sektör">
              <input
                value={campaign.sector}
                onChange={(e) => updateField("sector", e.target.value)}
                className="form-input"
              />
            </Field>
            <Field label="Lokasyon">
              <input
                value={campaign.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="form-input"
              />
            </Field>
            <Field label="Bütçe / TL">
              <input
                type="number"
                min="0"
                value={campaign.budget}
                onChange={(e) => updateField("budget", Number(e.target.value) || 0)}
                className="form-input"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Hedef">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Hedef kitle">
              <textarea
                value={campaign.targetAudience}
                onChange={(e) => updateField("targetAudience", e.target.value)}
                className="form-input min-h-28 resize-none"
              />
            </Field>
            <Field label="Kampanya hedefi">
              <textarea
                value={campaign.campaignGoal}
                onChange={(e) => updateField("campaignGoal", e.target.value)}
                className="form-input min-h-28 resize-none"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Niche Tercihleri">
          <div className="flex flex-wrap gap-2">
            {nicheOptions.map((niche) => {
              const active = campaign.preferredNiches.includes(niche);
              return (
                <button
                  key={niche}
                  type="button"
                  onClick={() => toggleNiche(niche)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-brand text-primary-foreground shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {niche}
                </button>
              );
            })}
          </div>
        </FormSection>

        <Button
          type="button"
          onClick={onAnalyze}
          className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90 h-12 text-base font-semibold"
        >
          Influencer'ları analiz et
        </Button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-border pb-6 last:border-b-0 last:pb-0">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
