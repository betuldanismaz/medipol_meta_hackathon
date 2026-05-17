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
    <section className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <DemoDataBadge isMock={isMock} />
            <h1 className="mt-4 text-3xl font-black text-white sm:text-5xl">Kampanya olustur</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Demo icin hazir kampanya bilgileri dolu geliyor. Dilersen guncelleyip skorlari tekrar hesaplayabilirsin.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCampaign(sampleCampaign)}
            className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Ornek kampanyayi yukle
          </button>
        </div>

        <div className="card-gradient rounded-[2rem] p-4 sm:p-6">
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
            <Field label="Hedef kitle" wide>
              <textarea
                value={campaign.targetAudience}
                onChange={(event) => updateField("targetAudience", event.target.value)}
                className="matchfluence-input min-h-24 resize-none"
              />
            </Field>
            <Field label="Kampanya hedefi" wide>
              <textarea
                value={campaign.campaignGoal}
                onChange={(event) => updateField("campaignGoal", event.target.value)}
                className="matchfluence-input min-h-24 resize-none"
              />
            </Field>
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-slate-200">Tercih edilen niche'ler</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {nicheOptions.map((niche) => {
                const active = campaign.preferredNiches.includes(niche);

                return (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => toggleNiche(niche)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-white text-slate-950"
                        : "border border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {niche}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onAnalyze}
            className="mt-7 w-full rounded-2xl bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-200 px-6 py-4 text-base font-black text-slate-950 shadow-glow transition hover:-translate-y-0.5"
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
  wide?: boolean;
};

function Field({ label, children, wide = false }: FieldProps) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-2 block text-sm font-semibold text-slate-200">{label}</span>
      {children}
    </label>
  );
}
