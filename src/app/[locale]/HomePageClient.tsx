'use client'

import { useEffect, useState, Suspense, lazy } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Crosshair,
  ExternalLink,
  MessageCircle,
  Monitor,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useMessages } from 'next-intl'
import { VideoFeature } from '@/components/home/VideoFeature'
import { LatestGuidesAccordion } from '@/components/home/LatestGuidesAccordion'
import { NativeBannerAd, AdBanner } from '@/components/ads'
import { SidebarAd } from '@/components/ads/SidebarAd'
import { scrollToSection } from '@/lib/scrollToSection'
import { DynamicIcon } from '@/components/ui/DynamicIcon'
import type { ContentItemWithType } from '@/lib/getLatestArticles'
import type { ModuleLinkMap } from '@/lib/buildModuleLinkMap'

// Lazy load heavy components
const HeroStats = lazy(() => import('@/components/home/HeroStats'))
const FAQSection = lazy(() => import('@/components/home/FAQSection'))
const CTASection = lazy(() => import('@/components/home/CTASection'))

// Loading placeholder
const LoadingPlaceholder = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`} />
)

// Conditionally render text as a link or plain span
function LinkedTitle({
  linkData,
  children,
  className,
  locale,
}: {
  linkData: { url: string; title: string } | null | undefined
  children: React.ReactNode
  className?: string
  locale: string
}) {
  if (linkData) {
    const href = locale === 'en' ? linkData.url : `/${locale}${linkData.url}`
    return (
      <Link
        href={href}
        className={`${className || ''} hover:text-[hsl(var(--nav-theme-light))] hover:underline decoration-[hsl(var(--nav-theme-light))/0.4] underline-offset-4 transition-colors`}
        title={linkData.title}
      >
        {children}
      </Link>
    )
  }
  return <>{children}</>
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[]
  moduleLinkMap: ModuleLinkMap
  locale: string
}

export default function HomePageClient({ latestArticles, moduleLinkMap, locale }: HomePageClientProps) {
  const t = useMessages() as any
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.road-to-vostok.wiki'

  // Structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: "Road to Vostok Wiki",
        description: "Road to Vostok Wiki covering maps, weapons, tasks, traders, gear, demo updates, and survival tips for the hardcore PC survival FPS.",
        image: {
          '@type': 'ImageObject',
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Road to Vostok - Hardcore Single-Player Survival FPS",
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: "Road to Vostok Wiki",
        alternateName: "Road to Vostok",
        url: siteUrl,
        description: "Road to Vostok Wiki resource hub for maps, weapons, tasks, traders, gear, and survival guides",
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          '@type': 'ImageObject',
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Road to Vostok Wiki - Hardcore Single-Player Survival FPS",
        },
        sameAs: [
          'https://store.steampowered.com/app/1963610/Road_to_Vostok/',
          'https://discord.gg/roadtovostok',
          'https://www.reddit.com/r/RoadtoVostokGame/',
          'https://www.youtube.com/@roadtovostok',
          'https://roadtovostok.com/',
        ],
      },
      {
        '@type': 'VideoGame',
        name: "Road to Vostok",
        gamePlatform: ['PC', 'Windows', 'Linux', 'Steam'],
        applicationCategory: 'Game',
        genre: ['Survival', 'FPS', 'Action', 'Adventure'],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 1,
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: 'https://store.steampowered.com/app/1963610/Road_to_Vostok/',
        },
      },
    ],
  }

  // Roadmap accordion state
  const [roadmapExpanded, setRoadmapExpanded] = useState<number | null>(null)

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-reveal-visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.scroll-reveal').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 左侧广告容器 - Fixed 定位 */}
      <aside
        className="hidden xl:block fixed top-20 w-40 z-10"
        style={{ left: 'calc((100vw - 896px) / 2 - 180px)' }}
      >
        <SidebarAd type="sidebar-160x300" adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X300} />
      </aside>

      {/* 右侧广告容器 - Fixed 定位 */}
      <aside
        className="hidden xl:block fixed top-20 w-40 z-10"
        style={{ right: 'calc((100vw - 896px) / 2 - 180px)' }}
      >
        <SidebarAd type="sidebar-160x600" adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X600} />
      </aside>

      {/* 广告位 1: 移动端横幅 Sticky */}
      {/* <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div> */}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-6">
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-sm font-medium">{t.hero.badge}</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => scrollToSection('beginner-guide')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://roadtovostok.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-lg transition-colors"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* 广告位 2: 原生横幅 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ''} />

      {/* Video Section */}
      <section className="px-4 py-12">
        <div className="scroll-reveal container mx-auto max-w-4xl">
          <div className="relative rounded-2xl overflow-hidden">
            <VideoFeature
              videoId="OTFgTRsz43Q"
              title="ROAD TO VOSTOK | EARLY ACCESS TRAILER"
              posterImage="/images/hero.webp"
            />
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={30} />

      {/* 广告位 3: 标准横幅 728×90 */}
      <AdBanner type="banner-728x90" adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90} />

      {/* Tools Grid - 16 Navigation Cards */}
      <section className="px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 scroll-reveal">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.tools.title}{' '}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              // 映射卡片索引到 section ID
              const sectionIds = [
                'release-date', 'beginner-guide', 'maps', 'roadmap',
                'system-requirements', 'weapons-guide', 'zone-guide', 'shelter-customization'
              ]
              const sectionId = sectionIds[index]

              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group p-6 rounded-xl border border-border
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg mb-4
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors">
                    <DynamicIcon
                      name={card.icon}
                      className="w-6 h-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="font-semibold mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* 广告位 4: 方形广告 300×250 */}
      <AdBanner type="banner-300x250" adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250} />

      {/* Module 1: Release Date */}
      <section id="release-date" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                             bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                             text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-4">
              {t.modules.releaseDate.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.modules.releaseDate.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.releaseDate.intro}
            </p>
          </div>

          {/* Spec Table */}
          <div className="scroll-reveal overflow-hidden rounded-xl border border-border">
            <div className="hidden md:grid grid-cols-2 divide-y divide-border">
              {t.modules.releaseDate.items.map((item: any, index: number) => (
                <div key={index} className={`flex items-center gap-4 p-5 ${index % 4 < 2 ? 'bg-white/[0.02]' : 'bg-white/[0.04]'} hover:bg-[hsl(var(--nav-theme)/0.05)] transition-colors`}>
                  <span className="text-sm font-medium text-muted-foreground w-48 flex-shrink-0">{item.label}</span>
                  <span className="text-sm font-semibold text-[hsl(var(--nav-theme-light))]">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="md:hidden divide-y divide-border">
              {t.modules.releaseDate.items.map((item: any, index: number) => (
                <div key={index} className="p-4 bg-white/[0.02]">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-[hsl(var(--nav-theme-light))]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 广告位 5: 中型横幅 468×60 */}
      <AdBanner type="banner-468x60" adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60} />

      {/* Module 2: Beginner Guide */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                             bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                             text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-4">
              {t.modules.beginnerGuide.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.modules.beginnerGuide.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.beginnerGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal relative space-y-4 mb-10">
            {t.modules.beginnerGuide.steps.map((step: any, index: number) => (
              <div key={index} className="flex gap-4 p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[hsl(var(--nav-theme)/0.2)] border-2 border-[hsl(var(--nav-theme)/0.5)] flex items-center justify-center">
                  <span className="text-xl font-bold text-[hsl(var(--nav-theme-light))]">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tips */}
          <div className="scroll-reveal p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-lg">Survival Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.beginnerGuide.quickTips.map((tip: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 320×50 */}
      <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />

      {/* Module 3: Maps */}
      <section id="maps" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                             bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                             text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-4">
              {t.modules.maps.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.modules.maps.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.maps.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.maps.items.map((map: any, index: number) => {
              const riskColor: Record<string, string> = {
                'Low to Medium': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                'Starter Run': 'bg-sky-500/10 border-sky-500/30 text-sky-400',
                'High': 'bg-orange-500/10 border-orange-500/30 text-orange-400',
                'Extreme': 'bg-red-500/10 border-red-500/30 text-red-400',
              }
              const riskClass = riskColor[map.risk] || 'bg-[hsl(var(--nav-theme)/0.1)] border-[hsl(var(--nav-theme)/0.3)]'
              return (
                <div key={index} className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">{map.zone}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${riskClass}`}>{map.risk}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-[hsl(var(--nav-theme-light))]">{map.title}</h3>
                  <p className="text-muted-foreground text-sm">{map.summary}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Module 4: Roadmap */}
      <section id="roadmap" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                             bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                             text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-4">
              {t.modules.roadmap.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.modules.roadmap.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.roadmap.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-2">
            {t.modules.roadmap.items.map((item: any, index: number) => (
              <div key={index} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setRoadmapExpanded(roadmapExpanded === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${index === 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : index <= 2 ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-[hsl(var(--nav-theme)/0.1)] border-[hsl(var(--nav-theme)/0.3)]'}`}>
                      {item.date}
                    </span>
                    <span className="font-semibold">{item.heading}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform ${roadmapExpanded === index ? 'rotate-180' : ''}`} />
                </button>
                {roadmapExpanded === index && (
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground text-sm mb-3">{item.summary}</p>
                    <ul className="space-y-1">
                      {item.bullets.map((bullet: string, bi: number) => (
                        <li key={bi} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 5: System Requirements */}
      <section id="system-requirements" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                             bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                             text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-4">
              <Monitor className="w-3.5 h-3.5" />
              {t.modules.systemRequirements.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.modules.systemRequirements.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.systemRequirements.intro}
            </p>
          </div>

          {/* Spec Table - Desktop */}
          <div className="scroll-reveal overflow-hidden rounded-xl border border-border mb-8">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[hsl(var(--nav-theme)/0.1)] border-b border-border">
                    {t.modules.systemRequirements.headers.map((h: string, i: number) => (
                      <th key={i} className={`px-5 py-3 text-left font-semibold ${i === 0 ? 'text-muted-foreground w-32' : 'text-[hsl(var(--nav-theme-light))]'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.modules.systemRequirements.rows.map((row: any, i: number) => (
                    <tr key={i} className={`border-b border-border hover:bg-[hsl(var(--nav-theme)/0.05)] transition-colors ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.04]'}`}>
                      <td className="px-5 py-3 text-muted-foreground font-medium">{row.spec}</td>
                      <td className="px-5 py-3">{row.minimum}</td>
                      <td className="px-5 py-3 font-medium text-[hsl(var(--nav-theme-light))]">{row.recommended}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile stacked cards */}
            <div className="md:hidden divide-y divide-border">
              {t.modules.systemRequirements.rows.map((row: any, i: number) => (
                <div key={i} className="p-4 bg-white/[0.02]">
                  <p className="text-xs text-muted-foreground font-medium mb-2">{row.spec}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Minimum</p>
                      <p className="text-sm font-medium">{row.minimum}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Recommended</p>
                      <p className="text-sm font-semibold text-[hsl(var(--nav-theme-light))]">{row.recommended}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Check List */}
          <div className="scroll-reveal p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-lg">Quick Check</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.systemRequirements.quickCheck.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 广告位: 标准横幅 */}
      <AdBanner type="banner-728x90" adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90} />

      {/* Module 6: Weapons Guide */}
      <section id="weapons-guide" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                             bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                             text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-4">
              <Crosshair className="w-3.5 h-3.5" />
              {t.modules.weaponsGuide.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.modules.weaponsGuide.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.weaponsGuide.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.weaponsGuide.items.map((item: any, index: number) => (
              <div key={index} className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center flex-shrink-0">
                    <Crosshair className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                  </div>
                  <h3 className="font-bold text-[hsl(var(--nav-theme-light))]">{item.category}</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground"><span className="font-medium text-foreground/80">Examples:</span> {item.examples}</p>
                  {item.ammo !== '—' && (
                    <p className="text-muted-foreground"><span className="font-medium text-foreground/80">Ammo:</span> {item.ammo}</p>
                  )}
                </div>
                <p className="text-xs text-[hsl(var(--nav-theme-light))/0.9] bg-[hsl(var(--nav-theme)/0.08)] rounded-lg px-3 py-2 mt-auto">
                  {item.keyFact}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位: 方形广告 */}
      <AdBanner type="banner-300x250" adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250} />

      {/* Module 7: Zone Guide */}
      <section id="zone-guide" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                             bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                             text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-4">
              {t.modules.zoneGuide.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.modules.zoneGuide.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.zoneGuide.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-3">
            {t.modules.zoneGuide.items.map((item: any, index: number) => {
              const badgeColor: Record<string, string> = {
                'Low Risk':    'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                'High Risk':   'bg-orange-500/10 border-orange-500/30 text-orange-400',
                'Permadeath':  'bg-red-500/10 border-red-500/30 text-red-400',
                'Strategy':    'bg-sky-500/10 border-sky-500/30 text-sky-400',
              }
              const badgeClass = badgeColor[item.badge] || 'bg-[hsl(var(--nav-theme)/0.1)] border-[hsl(var(--nav-theme)/0.3)]'
              return (
                <details key={index} className="group border border-border rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${badgeClass}`}>
                        {item.badge}
                      </span>
                      <span className="font-semibold">{item.heading}</span>
                      <span className="text-sm text-muted-foreground hidden sm:inline">{item.summary}</span>
                    </div>
                    <ChevronDown className="w-5 h-5 flex-shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-5 pt-1">
                    <ul className="space-y-2">
                      {item.details.map((detail: string, di: number) => (
                        <li key={di} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              )
            })}
          </div>
        </div>
      </section>

      {/* 广告位: 中型横幅 */}
      <AdBanner type="banner-468x60" adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60} />

      {/* Module 8: Shelter Customization */}
      <section id="shelter-customization" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12 scroll-reveal">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                             bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]
                             text-xs font-medium text-[hsl(var(--nav-theme-light))] mb-4">
              {t.modules.shelterCustomization.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.modules.shelterCustomization.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              {t.modules.shelterCustomization.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {t.modules.shelterCustomization.items.map((item: any, index: number) => (
              <div key={index} className={`p-6 rounded-xl border border-border hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col gap-4 ${index === 4 ? 'sm:col-span-2 lg:col-span-1' : ''} bg-white/5`}>
                <div className="w-12 h-12 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center">
                  <DynamicIcon name={item.icon} className="w-6 h-6 text-[hsl(var(--nav-theme-light))]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner type="banner-728x90" adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90} />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">{t.footer.description}</p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://discord.gg/roadtovostok"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.reddit.com/r/RoadtoVostokGame/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@roadtovostok"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://store.steampowered.com/app/1963610/Road_to_Vostok/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t.footer.copyright}</p>
              <p className="text-xs text-muted-foreground">{t.footer.disclaimer}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
