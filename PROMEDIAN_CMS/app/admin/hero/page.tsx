"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type HeroSettings = {
  eyebrow: string;
  headline: string;
  accent_headline: string;
  description: string;
  image_url: string;
  feature_1: string;
  feature_2: string;
  feature_3: string;
  feature_4: string;
};

const defaults: HeroSettings = {
  eyebrow: "D4 PRODUKSI MEDIA · IMDE",
  headline: "Wujudkan Ide Kreatif Menjadi",
  accent_headline: "Karya Media Berdampak.",
  description:
    "Belajar, berkarya, dan berkolaborasi dalam ekosistem industri media digital.",
  image_url: "/images/hero-promedian-background.jpg",
  feature_1: "Praktik Produksi Media",
  feature_2: "Terhubung dengan Industri (EMTEK Group)",
  feature_3: "Kurikulum Berbasis Proyek (65% Praktik)",
  feature_4: "Siap Berkarya di Industri Media Digital",
};

export default function HeroSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<HeroSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

const { data: admin } = await supabase
  .from("admin_users")
  .select("user_id")
  .eq("user_id", user.id)
  .maybeSingle();

      if (!admin) {
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("hero_settings")
        .select("*")
        .eq("id", "main")
        .maybeSingle();

      if (error) {
        setMessage("Gagal mengambil pengaturan: " + error.message);
      } else if (data) {
        setForm({ ...defaults, ...data });
      }

      setLoading(false);
    }

    loadSettings();
  }, [router]);

  function updateField(
    field: keyof HeroSettings,
    value: string
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("hero_settings").upsert({
      id: "main",
      ...form,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      setMessage("Gagal menyimpan: " + error.message);
    } else {
      setMessage("Pengaturan Hero Banner berhasil disimpan.");
    }
  }

  if (loading) {
    return <main className="wrap">Memuat pengaturan...</main>;
  }

  const fields: {
    key: keyof HeroSettings;
    label: string;
    multiline?: boolean;
  }[] = [
    { key: "eyebrow", label: "Label kecil di atas judul" },
    { key: "headline", label: "Judul utama" },
    { key: "accent_headline", label: "Judul aksen / baris kedua" },
    { key: "description", label: "Deskripsi", multiline: true },
    { key: "image_url", label: "URL gambar background" },
    { key: "feature_1", label: "Keunggulan 1" },
    { key: "feature_2", label: "Keunggulan 2" },
    { key: "feature_3", label: "Keunggulan 3" },
    { key: "feature_4", label: "Keunggulan 4" },
  ];

  return (
    <main className="wrap">
      <header className="top">
        <div className="brand">
          <div className="mark">P</div>
          <div>
            <b>PROMEDIAN</b>
            <small>ADMIN DASHBOARD</small>
          </div>
        </div>
        <a className="btn secondary" href="/admin">
          Kembali ke Dashboard
        </a>
      </header>

      <section className="panel">
        <div className="panelhead">
          <div>
            <span className="eyebrow">HOMEPAGE</span>
            <h1>Pengaturan Hero Banner</h1>
            <p className="muted">
              Ubah tampilan banner utama halaman depan PROMEDIAN.
            </p>
          </div>
        </div>

        <div className="notice">
          Perubahan yang disimpan akan digunakan pada banner utama website.
          Untuk gambar, masukkan URL gambar yang dapat diakses publik.
        </div>

        <form onSubmit={saveSettings}>
          <div className="formgrid">
            {fields.map((field) => (
              <div
                className={`field ${field.multiline ? "full" : ""}`}
                key={field.key}
              >
                <label>{field.label}</label>
                {field.multiline ? (
                  <textarea
                    value={form[field.key]}
                    onChange={(e) =>
                      updateField(field.key, e.target.value)
                    }
                  />
                ) : (
                  <input
                    value={form[field.key]}
                    onChange={(e) =>
                      updateField(field.key, e.target.value)
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {form.image_url && (
            <div className="field">
              <label>Pratinjau gambar</label>
              <img
                src={form.image_url}
                alt="Pratinjau Hero Banner"
                style={{
                  width: "100%",
                  maxHeight: 280,
                  objectFit: "cover",
                  borderRadius: 12,
                }}
              />
            </div>
          )}

          {message && (
            <p className={message.startsWith("Gagal") ? "error" : "success"}>
              {message}
            </p>
          )}

          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </form>
      </section>
    </main>
  );
}
