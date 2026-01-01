'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/** ONE-FILE CRAZY LANDING PAGE — drop this into app/page.tsx  **/

export default function Landing() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#060b12] text-white selection:bg-cyan-400/30">
      <BackgroundFX />

      <NavBar />

      <Hero />

      <StatMarquee />

      <Features />

      <Story />

      <Showcase />

      <CTA />

      <Footer />
    </main>
  );
}

/* =========================  SECTIONS  ========================= */

function NavBar() {
  return (
    <div className="sticky top-0 z-40 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_30px_#22d3ee] grid place-items-center">
            <span className="text-black text-lg">🐷</span>
          </div>
          <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
            TimeVault
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#story" className="hover:text-white">How it works</a>
          <a href="#demo" className="hover:text-white">Demo</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </div>
        <a
          href="/dashboard"
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_25px_#22d3ee99]"
        >
          Launch App 🚀
        </a>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
        <Glare />
        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight"
        >
          Save Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">DeFi Deity</span>.
          <br className="hidden md:block" />
          <span className="text-white/80">Lock. Wait. Grow.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mt-5 text-lg md:text-xl text-white/70 max-w-2xl mx-auto"
        >
          A timelock piggy bank on <b>Mantle Sepolia Testnet</b>. Deposit MNT or any ERC-20,
          watch the neon countdown tick, and unlock with a single click.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/dashboard"
            className="px-7 py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_35px_#22d3ee66]"
          >
            Start Saving Now ✨
          </a>
          <a
            href="#story"
            className="px-7 py-4 text-lg font-semibold rounded-2xl border border-white/15 hover:border-white/30 text-white/90"
          >
            See How It Works ▶
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="relative mt-14 mx-auto w-full max-w-4xl rounded-2xl border border-cyan-400/20 bg-gradient-to-b from-white/5 to-white/0 p-6"
        >
          <VaultPreview />
        </motion.div>
      </div>
    </section>
  );
}

function StatMarquee() {
  const stats = [
    'Non-custodial', 'ERC-20 Support', 'Fee-on-Transfer Safe',
    'Reentrancy-Guarded', 'Batch Withdraw', 'Countdown Timers',
    'Dark Neon UI', 'Mantle Sepolia Testnet'
  ];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-white/5">
      <div className="animate-[marquee_30s_linear_infinite] whitespace-nowrap py-3 text-cyan-300/90">
        {Array.from({ length: 2 }).map((_, k) => (
          <span key={k}>
            {stats.map((s, i) => (
              <span key={`${k}-${i}`} className="mx-6">✦ {s}</span>
            ))}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

function Features() {
  const cards = [
    { icon: '💎', title: 'Deposit MNT', desc: 'Lock native MNT (EVM) with one click using depositETH().' },
    { icon: '🪙', title: 'Any ERC-20', desc: 'Approve & timelock USDC/DAI/Mock tokens with depositToken().' },
    { icon: '⏳', title: 'Custom Lock', desc: 'From 1 minute (demo) to 1 year. You decide the discipline.' },
    { icon: '🔐', title: 'Audit-Ready Safety', desc: 'Non-reentrant, checks-effects-interactions, FoT measured by balance delta.' },
    { icon: '🧰', title: 'Batch Withdraw', desc: 'Unlock all matured deposits in a single transaction.' },
    { icon: '🌌', title: 'Neon UX', desc: 'Glowing countdowns, soft shadows, and a sci-fi vault experience.' },
  ];

  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center">
          Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">TimeVault</span>?
        </h2>
        <p className="text-white/70 text-center mt-3">
          Simple savings, serious security, show-stopping UI.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 shadow-[0_0_30px_#22d3ee22] hover:shadow-[0_0_50px_#22d3ee55] transition"
            >
              <div className="text-3xl">{c.icon}</div>
              <div className="mt-3 text-xl font-semibold">{c.title}</div>
              <p className="mt-2 text-white/70">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Story() {
  const steps = [
    { title: 'Connect Wallet', desc: 'Open the app and connect MetaMask on Mantle Sepolia Testnet.', icon: '🔌' },
    { title: 'Deposit Tokens', desc: 'MNT via depositETH or any ERC-20 via approve + depositToken.', icon: '💰' },
    { title: 'Watch the Glow', desc: 'Each deposit gets a neon countdown to its unlock time.', icon: '🌃' },
    { title: 'Withdraw All Matured', desc: 'One button. Many deposits. Zero hassle.', icon: '🗝️' },
  ];
  return (
    <section id="story" className="py-20 md:py-28 bg-gradient-to-b from-white/[0.03] to-transparent">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center">User Journey</h2>
        <p className="text-white/70 text-center mt-3">A frictionless path from “I should save” to “I did.”</p>

        <div className="relative mt-12">
          <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500/40 to-blue-600/40 rounded-full"></div>
          <div className="space-y-10">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5 }}
                className={`relative md:grid md:grid-cols-2 md:gap-10 items-center ${i % 2 ? 'md:text-left' : 'md:text-right'}`}
              >
                <div className={`hidden md:block ${i % 2 ? 'order-2' : 'order-1'}`}></div>
                <div className={`relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_#22d3ee22] ${i % 2 ? 'order-1' : 'order-2'}`}>
                  <div className="text-2xl">{s.icon}</div>
                  <div className="mt-2 text-xl font-semibold">{s.title}</div>
                  <p className="mt-1 text-white/70">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Showcase() {
  return (
    <section id="demo" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center">The Vault, Visualized</h2>
        <p className="text-white/70 text-center mt-3">
          Neon cards for deposits. Countdown rings. A batch-withdraw key when time’s up.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
            <DemoCard 
            title="Deposit MNT" 
            hint="Set amount + lock seconds, sign, done." 
            imgSrc="/images/deposit-flow.png" 
            />

            <DemoCard 
            title="Deposit ERC-20" 
            hint="Approve → deposit → timer appears." 
            imgSrc="/images/deposit-erc20.png" 
            />

            <DemoCard 
            title="Countdown Timers" 
            hint="Each card shows time remaining to unlock." 
            imgSrc="/images/countdown.png" 
            />

            <DemoCard 
            title="Withdraw All Matured" 
            hint="Collect every unlocked deposit in one tx." 
            imgSrc="/images/withdraw.png" 
            />

        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="start" className="py-20 md:py-28 relative">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,.2),transparent_60%)]" />
        <h2 className="text-4xl md:text-5xl font-extrabold">
          Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">lock the bag</span>?
        </h2>
        <p className="text-white/70 mt-3">
          Deploy once, connect MetaMask, and start your savings streak on Mantle Sepolia Testnet.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="/dashboard"
            className="px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_35px_#22d3ee66]"
          >
            Launch dApp 🚀
          </a>
          <a
            href="#features"
            className="px-8 py-4 rounded-2xl font-semibold border border-white/15 hover:border-white/30"
          >
            Explore Features
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="faq" className="border-t border-white/10 py-10">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-3 gap-8 text-sm text-white/70">
        <div>
          <div className="font-bold text-white">TimeVault</div>
          <p className="mt-2">Timelock savings on Mantle Sepolia Testnet — ETH/MNT & ERC-20 friendly.</p>
        </div>
        <div>
          <div className="font-semibold text-white">FAQ</div>
          <ul className="mt-2 space-y-2">
            <li><b>Is it custodial?</b> No, funds live in the contract you control.</li>
            <li><b>Can I withdraw early?</b> Nope. Timelock is the feature.</li>
            <li><b>Supported tokens?</b> Native MNT (as ETH) & any ERC-20.</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-white">Links</div>
          <ul className="mt-2 space-y-2">
            <li><a className="hover:text-white" href="#start">App</a></li>
            <li><a className="hover:text-white" href="#features">Features</a></li>
            <li><a className="hover:text-white" href="#story">How it works</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-white/50 mt-6">© {new Date().getFullYear()} TimeVault</div>
    </footer>
  );
}

/* =========================  COMPONENTS  ========================= */

function BackgroundFX() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-50 bg-[radial-gradient(ellipse_at_top,rgba(0,204,255,.15),transparent_60%)]" />
      <div className="pointer-events-none fixed inset-0 -z-50 bg-[radial-gradient(ellipse_at_bottom,rgba(37,99,235,.12),transparent_60%)]" />
      <div className="pointer-events-none fixed inset-0 -z-50 bg-[conic-gradient(from_180deg_at_50%_120%,rgba(34,211,238,.06),transparent_30%)]" />
      <GridOverlay />
    </>
  );
}

function GridOverlay() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-40 opacity-[.04] bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] bg-[size:40px_40px]"
    />
  );
}

function Glare() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[90vw] h-[90vw] max-w-[1200px] rounded-full blur-3xl opacity-30"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(34,211,238,0.35), rgba(59,130,246,0.25), transparent 60%)',
      }}
    />
  );
}

function VaultPreview() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Card title="💎 Deposit MNT" lines={['Amount: 0.05 MNT', 'Lock: 300s', 'Status: Ready to sign']} />
      <Card title="🪙 Deposit Token" lines={['Token: 0x…USDC', 'Amount: 100', 'Lock: 300s']} />
      <Card title="⏳ Countdown" lines={['Unlock in: 4m 12s', 'Glow increases as it matures']} />
      <Card title="🗝️ Withdraw All" lines={['2 deposits matured', '1 click → all back']} />
    </div>
  );
}

function Card({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 p-4 bg-white/[0.03] hover:bg-white/[0.05] transition shadow-[0_0_25px_#22d3ee22]">
      <div className="font-semibold">{title}</div>
      <ul className="mt-2 text-sm text-white/70 space-y-1">
        {lines.map((l, i) => <li key={i}>• {l}</li>)}
      </ul>
    </div>
  );
}

function DemoCard({ title, hint, imgSrc }: { title: string; hint: string; imgSrc: string }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-6 shadow-[0_0_30px_#22d3ee22]"
      >
        <div className="text-xl font-semibold font-rubik">{title}</div>
        <p className="text-white/70 mt-2">{hint}</p>
        
        {/* Image preview div */}
        <div className="mt-4 h-28 rounded-lg border border-white/10 overflow-hidden">
          <img 
            src={imgSrc} 
            alt={title} 
            className="w-full h-full object-cover" 
          />
        </div>
      </motion.div>
    );
  }
  

/* =========================  PROGRESS PARALLAX (fun)  ========================= */

function ParallaxRing() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.25, 0.6]);
  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className="absolute -z-10 left-1/2 -translate-x-1/2 top-40 w-[800px] h-[800px] rounded-full border border-cyan-400/30"
    />
  );
}
