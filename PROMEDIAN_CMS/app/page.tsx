"use client";
import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { sections } from "@/lib/sections";
import Link from "next/link";

type Item = { id:string; section:string; title:string; description:string|null; category:string|null; image_url:string|null; video_url:string|null; published:boolean; sort_order:number };
type HeroSettings = { eyebrow:string; headline:string; accent_headline:string; description:string; image_url:string|null; feature_1:string; feature_2:string; feature_3:string; feature_4:string };
const defaultHero:HeroSettings = { eyebrow:"D4 PRODUKSI MEDIA · IMDE", headline:"Wujudkan Ide Kreatif Menjadi", accent_headline:"Karya Media Berdampak.", description:"Belajar, berkarya, dan berkolaborasi dalam ekosistem industri media digital.", image_url:"/images/hero-promedian-background.jpg", feature_1:"Praktik Produksi Media", feature_2:"Terhubung dengan Industri (EMTEK Group)", feature_3:"Kurikulum Berbasis Proyek (65% Praktik)", feature_4:"Siap Berkarya di Industri Media Digital" };
export default function Home() {
  const [items,setItems]=useState<Item[]>([]);
  const [loading,setLoading]=useState(true);
  const [hero,setHero]=useState<HeroSettings>(defaultHero);
  useEffect(()=>{ if(!supabaseConfigured){setLoading(false);return}
    Promise.all([
      supabase.from("content_items").select("*").eq("published",true).order("sort_order"),
      supabase.from("hero_settings").select("*").eq("id","main").maybeSingle()
    ]).then(([contentResult,heroResult])=>{
      setItems((contentResult.data||[]) as Item[]);
      if(heroResult.data) setHero({...defaultHero,...heroResult.data});
      setLoading(false);
    });
  },[]);
  const get=(s:string)=>items.filter(x=>x.section===s);
  return <main className="wrap">
    <header className="top"><div className="brand"><div className="mark">P</div><div><b>PROMEDIAN</b><small>EXPLORE · CREATE · INSPIRE</small></div></div><Link className="btn secondary" href="/admin/login">Admin ↗</Link></header>
    <section className="hero-banner-live" aria-label="PROMEDIAN D4 Produksi Media IMDE" style={{backgroundImage:`linear-gradient(90deg,rgba(7,12,31,.94) 0%,rgba(7,12,31,.78) 48%,rgba(7,12,31,.18) 100%),url("${hero.image_url||defaultHero.image_url}")`}}>
      <div className="hero-live-content">
        <div className="hero-live-eyebrow">{hero.eyebrow}</div>
        <h1>{hero.headline}<br/><span>{hero.accent_headline}</span></h1>
        <p>{hero.description}</p>
        <div className="hero-live-features">{[hero.feature_1,hero.feature_2,hero.feature_3,hero.feature_4].filter(Boolean).map((feature,i)=><div className="hero-live-feature" key={i}><span>{["◉","▣","▶","↗"][i]}</span><b>{feature}</b></div>)}</div>
      </div>
    </section>
    <div className="stats"><div className="stat"><b>65%</b><span>Praktik dalam pembelajaran*</span></div><div className="stat"><b>D4</b><span>Sarjana Terapan</span></div><div className="stat"><b>EMTEK</b><span>Ekosistem industri</span></div><div className="stat"><b>Digital</b><span>Fokus media modern</span></div></div>
    {!supabaseConfigured&&<div className="notice" style={{marginTop:16}}>Database belum dikonfigurasi. Ikuti README untuk menghubungkan project Supabase. Data contoh di bawah hanya konten statis awal.</div>}
    <section id="profil"><div className="section-title"><div><div className="eyebrow">ABOUT THE PROGRAM</div><h2>Kenali Produksi Media</h2></div></div><div className="grid">
      {(get("profile").length?get("profile"):[{id:"p1",section:"profile",title:"D4 Produksi Media",description:"Program Sarjana Terapan yang memadukan kreativitas, keterampilan teknis, dan pemahaman industri untuk menghasilkan karya media.",category:"Profil",image_url:null,video_url:null,published:true,sort_order:1} as Item]).map(x=><article className="card" key={x.id}><span className="tag">{x.category||"Profil Prodi"}</span><h3 style={{marginTop:12}}>{x.title}</h3><p>{x.description}</p></article>)}
      <article className="card"><span className="tag">Pembelajaran</span><h3 style={{marginTop:12}}>65% Praktik · 35% Teori</h3><p>Belajar melalui proyek, simulasi produksi, dan kolaborasi tim.</p></article>
    </div></section>
    <section id="kurikulum"><div className="section-title"><div><div className="eyebrow">LEARNING EXPERIENCE</div><h2>Bidang pembelajaran</h2></div></div><div className="grid">{(get("curriculum").length?get("curriculum"):[
      {id:"c1",title:"Videografi & Sinematografi",description:"Teknik kamera, komposisi, visual storytelling, dan pencahayaan."},
      {id:"c2",title:"Editing & Post-production",description:"Penyuntingan video, audio, color grading, dan finishing karya."},
      {id:"c3",title:"Directing & Produksi",description:"Pengembangan konsep, penyutradaraan, dan manajemen produksi."}
    ] as Item[]).map(x=><article className="card" key={x.id}><h3>{x.title}</h3><p>{x.description}</p></article>)}</div></section>
    <section id="karya"><div className="section-title"><div><div className="eyebrow">MADE BY PROMEDIANS</div><h2>Karya mahasiswa</h2></div></div><div className="grid">{get("student_works").map(x=><article className="card" key={x.id}>{x.image_url&&<img src={x.image_url} alt={x.title} style={{width:"100%",height:160,objectFit:"cover",borderRadius:10,marginBottom:12}}/>}<span className="tag">{x.category||"Karya mahasiswa"}</span><h3 style={{marginTop:10}}>{x.title}</h3><p>{x.description}</p>{x.video_url&&<a className="btn secondary" href={x.video_url} target="_blank">Tonton karya ↗</a>}</article>)}{!get("student_works").length&&<div className="card"><p>Galeri karya mahasiswa akan ditampilkan setelah admin menambahkan konten.</p></div>}</div></section>
    {sections.filter(s=>["lecturers","facilities","industry","campus_life","admission"].includes(s.id)).map(s=><section key={s.id}><div className="section-title"><div><div className="eyebrow">PROMEDIAN EXPERIENCE</div><h2>{s.label}</h2></div></div><div className="grid">{get(s.id).map(x=><article className="card" key={x.id}>{x.image_url&&<img src={x.image_url} alt={x.title} style={{width:"100%",height:150,objectFit:"cover",borderRadius:10,marginBottom:12}}/>}<h3>{x.title}</h3><p>{x.description}</p>{x.video_url&&<a className="tag" href={x.video_url} target="_blank">Lihat detail ↗</a>}</article>)}{!get(s.id).length&&<div className="card"><p>Konten {s.label.toLowerCase()} dapat ditambahkan melalui Dashboard Admin.</p></div>}</div></section>)}
    <section style={{marginTop:34}}><div className="hero"><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h1 style={{fontSize:42}}>Ready to create<br/><span className="grad">your future?</span></h1><p>Kenali program studi, konsultasikan minatmu, dan cari tahu informasi penerimaan mahasiswa baru D4 Produksi Media IMDE.</p><div className="actions"><a className="btn" href="https://www.imde.ac.id/" target="_blank">Kunjungi Website IMDE ↗</a><a className="btn secondary" href="mailto:info@imde.ac.id">Hubungi IMDE</a></div></div></section>
    <footer className="footer"><span>© 2026 PROMEDIAN · D4 PRODUKSI MEDIA IMDE</span><span>EXPLORE · CREATE · INSPIRE</span></footer>
  </main>;
}
