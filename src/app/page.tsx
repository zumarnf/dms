import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FileUp,
  GitBranch,
  Search,
  FolderTree,
  Share2,
  History,
  ShieldCheck,
  Lock,
  KeyRound,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { LandingHeader } from "@/widgets/landing/LandingHeader";
import { Reveal } from "@/shared/ui/motion/Reveal";
import { LogoMark } from "@/shared/ui/brand/Logo";

export const metadata: Metadata = {
  title: "DMS — Document Management System",
  description:
    "Simpan, organisasi, versioning, cari, dan kelola akses dokumen dengan aman dalam satu tempat yang rapi dan modern.",
};

type Feature = { icon: LucideIcon; title: string; desc: string };

const features: Feature[] = [
  {
    icon: FileUp,
    title: "Unggah & Metadata",
    desc: "Unggah dokumen dengan validasi tipe & ukuran, lengkap dengan judul dan metadata.",
  },
  {
    icon: GitBranch,
    title: "Versioning",
    desc: "Setiap perubahan tersimpan sebagai versi. Lihat riwayat dan kembalikan versi aktif kapan saja.",
  },
  {
    icon: Search,
    title: "Pencarian Cepat",
    desc: "Full-text search bahasa alami menemukan dokumen relevan dalam hitungan milidetik.",
  },
  {
    icon: FolderTree,
    title: "Folder Hierarkis",
    desc: "Susun dokumen dalam folder bertingkat dengan breadcrumb dan pemindahan yang mudah.",
  },
  {
    icon: Share2,
    title: "Berbagi & Izin",
    desc: "Bagikan ke pengguna atau peran tertentu dengan level akses yang terkontrol.",
  },
  {
    icon: History,
    title: "Audit Trail",
    desc: "Jejak aktivitas lengkap untuk akuntabilitas — siapa melakukan apa dan kapan.",
  },
];

const securityPoints = [
  {
    icon: Lock,
    title: "Otorisasi di sisi server",
    desc: "Setiap akses dicek di lapisan data, bukan hanya UI — mencegah akses lintas pengguna (IDOR).",
  },
  {
    icon: KeyRound,
    title: "Kontrol akses berbasis peran",
    desc: "Empat peran dengan izin granular memastikan orang hanya melihat yang seharusnya.",
  },
  {
    icon: ScrollText,
    title: "Tervalidasi & tercatat",
    desc: "Validasi input ketat (Zod) dan audit trail menjaga integritas serta keterlacakan data.",
  },
];

const steps = [
  {
    n: "01",
    title: "Masuk dengan aman",
    desc: "Autentikasi email/password dengan sesi terlindungi.",
  },
  {
    n: "02",
    title: "Unggah & susun",
    desc: "Tarik dokumen ke folder, beri metadata, kelola versinya.",
  },
  {
    n: "03",
    title: "Cari & bagikan",
    desc: "Temukan cepat lewat pencarian, bagikan dengan izin tepat.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="blob bg-primary animate-float -top-24 -left-16 h-72 w-72" aria-hidden />
        <div
          className="blob bg-accent animate-float top-8 -right-20 h-80 w-80"
          style={{ animationDelay: "1.5s", opacity: 0.35 }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-24 text-center sm:px-8 sm:pt-28 sm:pb-32">
          <div className="animate-fade-up flex justify-center">
            <span className="glass elevate grid h-16 w-16 place-items-center rounded-2xl">
              <LogoMark className="h-9 w-9" />
            </span>
          </div>
          <span
            className="glass animate-fade-up text-muted-foreground mt-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium"
            style={{ animationDelay: "40ms" }}
          >
            <span className="bg-primary inline-block h-1.5 w-1.5 rounded-full" />
            Document Management System
          </span>

          <h1
            className="animate-fade-up mx-auto mt-6 max-w-3xl text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-6xl"
            style={{ animationDelay: "120ms" }}
          >
            Kelola dokumen dengan <span className="text-primary">tenang</span>, aman, dan rapi.
          </h1>

          <p
            className="animate-fade-up text-muted-foreground mx-auto mt-6 max-w-xl text-base text-balance sm:text-lg"
            style={{ animationDelay: "200ms" }}
          >
            Satu tempat untuk menyimpan, mencari, memberi versi, dan mengontrol akses dokumen tim
            Anda — modern, cepat, dan terlindungi.
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "280ms" }}
          >
            <Link
              href="/login"
              className="bg-primary text-primary-foreground elevate group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-7 text-sm font-medium transition-opacity hover:opacity-90 sm:w-auto"
            >
              Mulai sekarang
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#fitur"
              className="border-border bg-card/60 hover:bg-secondary inline-flex h-12 w-full items-center justify-center rounded-xl border px-7 text-sm font-medium transition-colors sm:w-auto"
            >
              Lihat fitur
            </a>
          </div>

          {/* Stats strip */}
          <div
            className="animate-fade-up mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4"
            style={{ animationDelay: "360ms" }}
          >
            {[
              { value: "4", label: "Peran akses" },
              { value: "100%", label: "Otorisasi server" },
              { value: "∞", label: "Riwayat versi" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl px-3 py-5">
                <div className="font-heading text-gradient text-3xl font-semibold sm:text-4xl">
                  {s.value}
                </div>
                <div className="text-muted-foreground mt-1 text-xs sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Semua yang dibutuhkan untuk dokumen
          </h2>
          <p className="text-muted-foreground mt-3 text-balance">
            Fitur lengkap dalam antarmuka yang tenang dan mudah — dari unggah sampai audit.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <article className="glass hover-lift h-full rounded-2xl p-6">
                <span className="bg-primary/12 text-primary grid h-11 w-11 place-items-center rounded-xl">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{f.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Security */}
      <section id="keamanan" className="border-border bg-surface-2/50 border-y">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <span className="bg-primary/12 text-primary inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Security-first
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Dibangun aman sejak fondasi
            </h2>
            <p className="text-muted-foreground mt-3 text-balance">
              Keamanan bukan tambahan. Otorisasi dipaksakan di server dan lapisan data, input
              divalidasi ketat, dan setiap tindakan tercatat.
            </p>
          </Reveal>

          <div className="flex flex-col gap-4">
            {securityPoints.map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <div className="glass hover-lift flex gap-4 rounded-2xl p-5">
                  <span className="bg-primary text-primary-foreground grid h-10 w-10 shrink-0 place-items-center rounded-xl">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{p.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Cukup tiga langkah</h2>
          <p className="text-muted-foreground mt-3 text-balance">
            Dari masuk hingga berbagi, alurnya ringkas dan jelas.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="border-border hover-lift bg-card relative h-full rounded-2xl border p-6">
                <span className="font-heading text-gradient text-4xl font-bold">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="bg-primary text-primary-foreground elevate relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12">
            <div
              className="blob animate-float -top-16 -right-8 h-56 w-56 bg-white/20"
              aria-hidden
            />
            <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
              Siap merapikan dokumen Anda?
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm text-balance opacity-90 sm:text-base">
              Masuk dan mulai kelola dokumen dengan aman hari ini.
            </p>
            <Link
              href="/login"
              className="text-primary elevate relative mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-medium transition-transform hover:scale-[1.02]"
            >
              Masuk ke DMS
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-border border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <LogoMark className="h-6 w-6" />
            <span className="font-medium">DMS</span>
          </div>
          <p>Document Management System — aman, modern, rapi.</p>
        </div>
      </footer>
    </div>
  );
}
