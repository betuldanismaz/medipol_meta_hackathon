"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import DemoDataBadge from "@/components/matchfluence/DemoDataBadge";
import { sampleCampaign } from "@/data/matchfluenceInfluencers";
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
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <DemoDataBadge isMock={isMock} />
            <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-5xl">
              Kampanya olustur
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Bilgileri doldur, AI en uygun influencer adaylarini siralasin.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCampaign(sampleCampaign)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Ornek kampanyayi yukle
          </button>
        </div>

        <div className="matchfluence-panel rounded-3xl p-4 sm:p-6">
          <FormSection title="Isletme bilgisi">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Isletme adi">
                <input
                  value={campaign.businessName}
                  onChange={(event) => updateField("businessName", event.target.value)}
                  className="matchfluence-input"
                />
              </Field>
              <Field label="Sektor">
                <input
                  value={campaign.sector}
                  onChange={(event) => updateField("sector", event.target.value)}
                  className="matchfluence-input"
                />
              </Field>
              <Field label="Lokasyon">
                <input
                  value={campaign.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  className="matchfluence-input"
                />
              </Field>
              <Field label="Butce / TL">
                <input
                  type="number"
                  min="0"
                  value={campaign.budget}
                  onChange={(event) => updateField("budget", Number(event.target.value) || 0)}
                  className="matchfluence-input"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Hedef">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Hedef kitle">
                <textarea
                  value={campaign.targetAudience}
                  onChange={(event) => updateField("targetAudience", event.target.value)}
                  className="matchfluence-input min-h-28 resize-none"
                />
              </Field>
              <Field label="Kampanya hedefi">
                <textarea
                  value={campaign.campaignGoal}
                  onChange={(event) => updateField("campaignGoal", event.target.value)}
                  className="matchfluence-input min-h-28 resize-none"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Niche tercihleri">
            <div className="flex flex-wrap gap-2">
              {nicheOptions.map((niche) => {
                const active = campaign.preferredNiches.includes(niche);

                return (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => toggleNiche(niche)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-slate-950 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {niche}
                  </button>
                );
              })}
            </div>
          </FormSection>

          <button
            type="button"
            onClick={onAnalyze}
            className="mt-6 w-full rounded-2xl bg-slate-950 px-6 py-4 text-base font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Influencer'lari analiz et
          </button>
        </div>
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-slate-100 py-5 first:pt-0 last:border-b-0 last:pb-0">
      <h2 className="mb-4 text-sm font-black uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </section>
  );
}
