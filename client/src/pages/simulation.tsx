import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Play, RotateCcw, ExternalLink, Search } from "lucide-react";
import { SiPaypal, SiCashapp, SiVenmo } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";

type GamePhase = "start" | "playing" | "results" | "investigate";
type Phenotype = "anxious" | "normal" | "relaxed";

function getPhenotype(lickCount: number): Phenotype {
  if (lickCount <= 30) return "anxious";
  if (lickCount <= 70) return "normal";
  return "relaxed";
}

function getPhenotypeLabel(p: Phenotype): string {
  if (p === "anxious") return "Low Care (Anxious Phenotype)";
  if (p === "normal") return "Medium Care (Normal Phenotype)";
  return "High Care (Relaxed Phenotype)";
}

function getPhenotypeColor(p: Phenotype): string {
  if (p === "anxious") return "text-foreground";
  if (p === "normal") return "text-muted-foreground";
  return "text-foreground";
}

function GameTimeline({ timeLeft, totalTime }: { timeLeft: number; totalTime: number }) {
  const elapsed = totalTime - timeLeft;
  const progress = (elapsed / totalTime) * 100;
  const currentDay = Math.min(7, Math.floor((elapsed / totalTime) * 7));

  return (
    <div className="w-full max-w-md" data-testid="timeline">
      <p className="text-sm font-semibold text-center mb-2">Timeline</p>
      <div className="h-3 bg-secondary rounded-full mb-2">
        <motion.div
          className="h-full bg-foreground/50 rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-0.5">
        {["birth", "1", "2", "3", "4", "5", "6", "7 days"].map((label, i) => (
          <span
            key={label}
            className={`${
              i <= currentDay ? "text-foreground font-medium" : ""
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function DNAVisualization({ lickCount }: { lickCount: number }) {
  const methylOpacity = Math.max(0, (100 - lickCount) / 100);
  const histoneSpread = 20 + (lickCount / 100) * 60;

  return (
    <svg
      viewBox="0 0 500 180"
      className="w-full max-w-lg mx-auto"
      data-testid="svg-dna-visualization"
    >
      <defs>
        <linearGradient id="dnaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#936d2d" />
          <stop offset="50%" stopColor="#b08840" />
          <stop offset="100%" stopColor="#936d2d" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3].map((i) => {
        const cx = 80 + i * 110;
        return (
          <g key={`histone-${i}`}>
            <circle
              cx={cx}
              cy={100 + (i % 2 === 0 ? -histoneSpread / 4 : histoneSpread / 4)}
              r={22}
              fill="#568aa2"
              opacity={0.6}
              stroke="#6a9db5"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={100 + (i % 2 === 0 ? -histoneSpread / 4 : histoneSpread / 4) + 4}
              textAnchor="middle"
              fontSize="9"
              fill="hsl(0, 0%, 75%)"
              fontFamily="monospace"
            >
              H3
            </text>
          </g>
        );
      })}

      <path
        d={`M 20 100 Q 80 ${100 - histoneSpread}, 135 100 Q 190 ${100 + histoneSpread}, 245 100 Q 300 ${100 - histoneSpread}, 355 100 Q 410 ${100 + histoneSpread}, 480 100`}
        fill="none"
        stroke="url(#dnaGrad)"
        strokeWidth={3}
        strokeLinecap="round"
      />

      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const x = 50 + i * 55;
        return (
          <g key={`methyl-${i}`} data-testid={`methyl-group-${i}`}>
            <circle
              cx={x}
              cy={50}
              r={10}
              fill="#568aa2"
              opacity={methylOpacity}
              stroke="#456f82"
              strokeWidth={1}
              style={{ transition: "opacity 0.3s ease" }}
            />
            <text
              x={x}
              y={54}
              textAnchor="middle"
              fontSize="7"
              fill="hsl(0, 0%, 90%)"
              fontFamily="monospace"
              opacity={methylOpacity}
              style={{ transition: "opacity 0.3s ease" }}
            >
              CH3
            </text>
            <line
              x1={x}
              y1={60}
              x2={x}
              y2={78}
              stroke="#568aa2"
              strokeWidth={1}
              opacity={methylOpacity}
              strokeDasharray="3,2"
              style={{ transition: "opacity 0.3s ease" }}
            />
          </g>
        );
      })}

      <text x="250" y={170} textAnchor="middle" fontSize="10" fill="hsl(0, 0%, 55%)" fontFamily="sans-serif">
        GR Gene Promoter Region
      </text>
    </svg>
  );
}

function RatPup({
  lickCount,
  onLick,
  isPlaying,
}: {
  lickCount: number;
  onLick: () => void;
  isPlaying: boolean;
}) {
  const phenotype = getPhenotype(lickCount);
  const [isPressed, setIsPressed] = useState(false);
  const [lickEffects, setLickEffects] = useState<{ id: number; x: number; y: number }[]>([]);
  const nextId = useRef(0);

  const triggerEffect = useCallback(
    (element: HTMLElement, clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const id = nextId.current++;
      setLickEffects((prev) => [...prev.slice(-8), { id, x, y }]);
      setTimeout(() => {
        setLickEffects((prev) => prev.filter((e) => e.id !== id));
      }, 600);
    },
    []
  );

  const handleInteraction = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isPlaying) return;
      onLick();
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 100);

      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      triggerEffect(e.currentTarget as HTMLElement, clientX, clientY);
    },
    [isPlaying, onLick, triggerEffect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onLick();
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 100);
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        triggerEffect(e.currentTarget as HTMLElement, rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    },
    [isPlaying, onLick, triggerEffect]
  );

  const bodyColor =
    phenotype === "relaxed"
      ? "#E8A040"
      : phenotype === "normal"
      ? "#D4882B"
      : "#B87020";

  const earColor =
    phenotype === "relaxed"
      ? "#D4952E"
      : phenotype === "normal"
      ? "#C07A22"
      : "#A5651A";

  return (
    <div
      role="button"
      tabIndex={isPlaying ? 0 : -1}
      aria-label="Click to nurture the capybara pup"
      className={`relative select-none outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md ${isPlaying ? "cursor-pointer" : "cursor-default"}`}
      onMouseDown={handleInteraction}
      onTouchStart={handleInteraction}
      onKeyDown={handleKeyDown}
      data-testid="button-lick-rat"
    >
      <motion.div
        animate={{ scale: isPressed ? 0.95 : 1 }}
        transition={{ duration: 0.1 }}
      >
        <svg viewBox="0 0 200 220" className="w-56 h-56 mx-auto">
          <defs>
            <radialGradient id="bodyGrad" cx="45%" cy="35%">
              <stop offset="0%" stopColor={bodyColor} stopOpacity="1" />
              <stop offset="100%" stopColor={earColor} stopOpacity="1" />
            </radialGradient>
            <radialGradient id="cheekGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#F4A87A" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F4A87A" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="68" cy="155" rx="22" ry="30" fill={bodyColor} stroke="#6B4513" strokeWidth="2" />
          <ellipse cx="132" cy="155" rx="22" ry="30" fill={bodyColor} stroke="#6B4513" strokeWidth="2" />
          <ellipse cx="68" cy="183" rx="14" ry="8" fill={earColor} stroke="#6B4513" strokeWidth="1.5" />
          <ellipse cx="132" cy="183" rx="14" ry="8" fill={earColor} stroke="#6B4513" strokeWidth="1.5" />

          <ellipse cx="100" cy="150" rx="58" ry="48" fill="url(#bodyGrad)" stroke="#6B4513" strokeWidth="2" />

          <ellipse cx="55" cy="155" rx="18" ry="28" fill={bodyColor} stroke="#6B4513" strokeWidth="2" />
          <ellipse cx="145" cy="155" rx="18" ry="28" fill={bodyColor} stroke="#6B4513" strokeWidth="2" />
          <ellipse cx="55" cy="181" rx="11" ry="6" fill={earColor} stroke="#6B4513" strokeWidth="1.5" />
          <ellipse cx="145" cy="181" rx="11" ry="6" fill={earColor} stroke="#6B4513" strokeWidth="1.5" />

          <circle cx="100" cy="80" r="62" fill="url(#bodyGrad)" stroke="#6B4513" strokeWidth="2.5" />

          <ellipse cx="62" cy="30" rx="16" ry="14" fill={bodyColor} stroke="#6B4513" strokeWidth="2" />
          <ellipse cx="138" cy="30" rx="16" ry="14" fill={bodyColor} stroke="#6B4513" strokeWidth="2" />
          <ellipse cx="62" cy="30" rx="10" ry="9" fill={earColor} opacity="0.7" />
          <ellipse cx="138" cy="30" rx="10" ry="9" fill={earColor} opacity="0.7" />

          <ellipse cx="78" cy="75" r="14" fill="white" />
          <ellipse cx="122" cy="75" r="14" fill="white" />
          <circle cx="80" cy="74" r="10" fill="#1a1a1a" />
          <circle cx="120" cy="74" r="10" fill="#1a1a1a" />
          <circle cx="83" cy="70" r="4" fill="white" />
          <circle cx="123" cy="70" r="4" fill="white" />
          <circle cx="78" cy="76" r="2" fill="white" opacity="0.5" />
          <circle cx="118" cy="76" r="2" fill="white" opacity="0.5" />

          <ellipse cx="100" cy="95" rx="8" ry="5" fill="#6B4513" />
          <ellipse cx="97" cy="93" rx="2.5" ry="2" fill="#4a3010" />
          <ellipse cx="103" cy="93" rx="2.5" ry="2" fill="#4a3010" />

          <circle cx="65" cy="90" r="14" fill="url(#cheekGrad)" />
          <circle cx="135" cy="90" r="14" fill="url(#cheekGrad)" />

          {phenotype === "relaxed" && (
            <>
              <path d="M 88 105 Q 94 114, 100 105" fill="none" stroke="#6B4513" strokeWidth="2" strokeLinecap="round" />
              <path d="M 100 105 Q 106 114, 112 105" fill="none" stroke="#6B4513" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
          {phenotype === "normal" && (
            <line x1="90" y1="106" x2="110" y2="106" stroke="#6B4513" strokeWidth="2" strokeLinecap="round" />
          )}
          {phenotype === "anxious" && (
            <path d="M 88 110 Q 100 100, 112 110" fill="none" stroke="#6B4513" strokeWidth="2" strokeLinecap="round" />
          )}

          <ellipse cx="100" cy="130" rx="22" ry="14" fill={earColor} opacity="0.5" />
        </svg>
      </motion.div>

      <AnimatePresence>
        {lickEffects.map((effect) => (
          <motion.div
            key={effect.id}
            initial={{ opacity: 1, scale: 0.5, x: effect.x - 12, y: effect.y - 12 }}
            animate={{ opacity: 0, scale: 1.5, y: effect.y - 40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute pointer-events-none"
          >
            <Heart className="w-6 h-6 text-muted-foreground fill-muted-foreground" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ResultsChart({ finalLickCount }: { finalLickCount: number }) {
  const grLevel = finalLickCount;
  const mRNALevel = Math.min(100, finalLickCount * 1.1);
  const proteinLevel = Math.min(100, finalLickCount * 0.9);
  const stressLevel = 100 - finalLickCount;

  const bars = [
    { label: "GR Levels", value: grLevel },
    { label: "mRNA Expression", value: mRNALevel },
    { label: "Protein Levels", value: proteinLevel },
    { label: "Stress Response", value: stressLevel },
  ];

  return (
    <div className="space-y-4 w-full max-w-md mx-auto" data-testid="results-chart">
      {bars.map((bar) => (
        <div key={bar.label} className="space-y-1">
          <div className="flex justify-between gap-2 text-sm">
            <span className="text-muted-foreground">{bar.label}</span>
            <span className="font-mono font-medium">{Math.round(bar.value)}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${bar.value}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-foreground/60 rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonationLinks() {
  return (
    <div className="inline-flex items-center gap-0" data-testid="donation-links">
      <a
        href="https://www.paypal.com/paypalme/mhirsch924535"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Donate via PayPal"
        data-testid="link-donate-paypal"
        className="inline-flex items-center justify-center w-8 h-8 rounded-md"
      >
        <SiPaypal className="w-5 h-5" style={{ color: "#003087" }} />
      </a>
      <a
        href="https://venmo.com/u/mhirsch924"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Donate via Venmo"
        data-testid="link-donate-venmo"
        className="inline-flex items-center justify-center w-8 h-8 rounded-md"
      >
        <SiVenmo className="w-5 h-5" style={{ color: "#3D95CE" }} />
      </a>
      <a
        href="https://cash.app/$maedos"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Donate via Cash App"
        data-testid="link-donate-cashapp"
        className="inline-flex items-center justify-center w-8 h-8 rounded-md"
      >
        <SiCashapp className="w-5 h-5" style={{ color: "#00C244" }} />
      </a>
    </div>
  );
}


export default function SimulationPage() {
  const [phase, setPhase] = useState<GamePhase>("start");
  const [lickCount, setLickCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [finalLickCount, setFinalLickCount] = useState(0);
  const [totalLicks, setTotalLicks] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const decayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lickCountRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (decayRef.current) clearInterval(decayRef.current);
    timerRef.current = null;
    decayRef.current = null;
  }, []);

  const startGame = useCallback(() => {
    clearTimers();
    setLickCount(0);
    lickCountRef.current = 0;
    setTimeLeft(60);
    setTotalLicks(0);
    setPhase("playing");

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimers();
          setFinalLickCount(lickCountRef.current);
          setPhase("results");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    decayRef.current = setInterval(() => {
      setLickCount((prev) => {
        const next = Math.max(0, prev - 1);
        lickCountRef.current = next;
        return next;
      });
    }, 2000);
  }, [clearTimers]);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  const handleLick = useCallback(() => {
    setLickCount((prev) => {
      const next = Math.min(100, prev + 3);
      lickCountRef.current = next;
      return next;
    });
    setTotalLicks((prev) => prev + 1);
  }, []);

  const phenotype = getPhenotype(lickCount);
  const stressLevel = 100 - lickCount;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-3" data-testid="header">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-foreground/10 flex items-center justify-center">
              <span className="text-sm font-bold text-foreground/70">CC</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Calm Your Capy</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Support this project</span>
            <DonationLinks />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">

          <AnimatePresence mode="wait">
            {phase === "start" && (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-8 py-8"
              >
                <div className="text-center space-y-4 max-w-xl">
                  <h2 className="text-3xl font-bold tracking-tight" data-testid="text-title">
                    Calm Your Capy
                  </h2>
                  <p className="text-muted-foreground text-base leading-relaxed" data-testid="text-description">
                    Explore how maternal care shapes gene expression through epigenetics.
                    You have <span className="font-semibold text-foreground">7 days</span> (from birth)
                    to nurture your capybara pup by clicking on it. Watch how your care affects DNA
                    methylation, histone modification, and the stress response in real-time.
                  </p>
                </div>

                <div className="opacity-60">
                  <RatPup lickCount={50} onLick={() => {}} isPlaying={false} />
                </div>

                <Card className="max-w-md w-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><span className="font-medium text-foreground">Goal:</span> Click the capybara pup to simulate maternal scrubbing/grooming.</p>
                      <p><span className="font-medium text-foreground">Effect:</span> More care = less DNA methylation = more GR expression = lower stress.</p>
                      <p><span className="font-medium text-foreground">Challenge:</span> The scrub count decays over time, so you need consistent care!</p>
                    </div>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-foreground/30" />
                        <span>0-30: Low Care (Anxious Phenotype)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-foreground/50" />
                        <span>31-70: Medium Care (Normal Phenotype)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-foreground/70" />
                        <span>71-100: High Care (Relaxed Phenotype)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <a
                  href="https://docs.google.com/document/d/1GrR2lAxLKTVtMAaBh39mK8ddzRr0038zST5N7LByl5s/copy?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-lab-activity"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover-elevate active-elevate-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Lab Activity Worksheet (Google Doc)
                </a>

                <Button size="lg" onClick={startGame} data-testid="button-start">
                  <Play className="w-4 h-4" />
                  Start Simulation
                </Button>
              </motion.div>
            )}

            {phase === "playing" && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col items-center gap-4">
                  <GameTimeline timeLeft={timeLeft} totalTime={60} />
                  <div className="flex items-center justify-between gap-4 w-full flex-wrap">
                    <div className="space-y-1">
                      <span className={`text-sm font-medium ${getPhenotypeColor(phenotype)}`} data-testid="text-phenotype">
                        {getPhenotypeLabel(phenotype)}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Total clicks: <span className="font-mono" data-testid="text-total-licks">{totalLicks}</span>
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-sm text-muted-foreground">Scrub Count</span>
                      <p className="text-2xl font-bold font-mono" data-testid="text-lick-count">
                        {Math.round(lickCount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">Stress-O-Meter</span>
                    <span className="font-mono text-xs" data-testid="text-stress-level">
                      {Math.round(stressLevel)}%
                    </span>
                  </div>
                  <Progress value={stressLevel} className="h-4" data-testid="progress-stress" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Relaxed</span>
                    <span>Stressed</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Capybara Pup</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-2">
                      <RatPup lickCount={lickCount} onLick={handleLick} isPlaying={true} />
                      <p className="text-xs text-muted-foreground text-center">
                        Click or tap the pup to nurture it
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">DNA Methylation</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                      <DNAVisualization lickCount={lickCount} />
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        {lickCount > 70
                          ? "Methyl groups removed - GR gene is active!"
                          : lickCount > 30
                          ? "Some methylation remains on the GR promoter"
                          : "Heavy methylation - GR gene is silenced"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Methylation</p>
                      <p className="text-xl font-bold font-mono" data-testid="text-methylation">
                        {Math.round(100 - lickCount)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">GR Expression</p>
                      <p className="text-xl font-bold font-mono" data-testid="text-gr-expression">
                        {Math.round(lickCount)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Chromatin</p>
                      <p className="text-xs font-medium" data-testid="text-chromatin">
                        {lickCount > 70 ? "Euchromatin (Open)" : lickCount > 30 ? "Intermediate" : "Heterochromatin (Closed)"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {phase === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-8 py-8"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight" data-testid="text-results-title">
                    Simulation Complete
                  </h2>
                  <p className="text-muted-foreground max-w-md" data-testid="text-results-phenotype">
                    Final phenotype:{" "}
                    <span className="font-semibold text-foreground">
                      {getPhenotypeLabel(getPhenotype(finalLickCount))}
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Molecular Outcomes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResultsChart finalLickCount={finalLickCount} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Session Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-md">
                          <p className="text-xs text-muted-foreground">Final Scrub Count</p>
                          <p className="text-2xl font-bold font-mono" data-testid="text-final-lick-count">
                            {Math.round(finalLickCount)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-md">
                          <p className="text-xs text-muted-foreground">Total Clicks</p>
                          <p className="text-2xl font-bold font-mono" data-testid="text-final-total-licks">
                            {totalLicks}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        {finalLickCount > 70 ? (
                          <p>
                            Excellent care! High maternal scrubbing removed methyl groups from the
                            GR gene promoter, increasing glucocorticoid receptor expression.
                            This pup will have a robust stress response and lower anxiety.
                          </p>
                        ) : finalLickCount > 30 ? (
                          <p>
                            Moderate care levels. Some methylation remains on the GR promoter,
                            resulting in average glucocorticoid receptor levels and a typical
                            stress response.
                          </p>
                        ) : (
                          <p>
                            Low care levels. Heavy methylation on the GR gene promoter silences
                            glucocorticoid receptor expression, leading to an elevated stress
                            response and anxious phenotype.
                          </p>
                        )}
                      </div>

                      <DNAVisualization lickCount={finalLickCount} />
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Investigate high and low nurtured capybara pups</span>
                    <Button onClick={() => setPhase("investigate")} data-testid="button-investigate">
                      GO!
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Scrub another capybara pup</span>
                    <Button variant="secondary" onClick={startGame} data-testid="button-restart">
                      GO!
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {phase === "investigate" && (
              <motion.div
                key="investigate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-8 py-8"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight" data-testid="text-investigate-title">
                    Investigate Nurtured Pups
                  </h2>
                  <p className="text-muted-foreground max-w-lg" data-testid="text-investigate-description">
                    Compare the molecular and behavioral outcomes of high-nurtured vs. low-nurtured capybara pups.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">High Nurtured Capybara Pup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center">
                        <RatPup lickCount={90} onLick={() => {}} isPlaying={false} />
                      </div>
                      <DNAVisualization lickCount={90} />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">DNA Methylation</span>
                          <span className="font-mono font-medium">10%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full">
                          <div className="h-full bg-foreground/50 rounded-full" style={{ width: "10%" }} />
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">GR Expression</span>
                          <span className="font-mono font-medium">90%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full">
                          <div className="h-full bg-foreground/50 rounded-full" style={{ width: "90%" }} />
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Stress Response</span>
                          <span className="font-mono font-medium">10%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full">
                          <div className="h-full bg-foreground/50 rounded-full" style={{ width: "10%" }} />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        High maternal care removes methyl groups from the GR gene promoter.
                        The open chromatin allows high GR expression, giving this pup a
                        calm temperament and robust stress coping.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Low Nurtured Capybara Pup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-center">
                        <RatPup lickCount={10} onLick={() => {}} isPlaying={false} />
                      </div>
                      <DNAVisualization lickCount={10} />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">DNA Methylation</span>
                          <span className="font-mono font-medium">90%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full">
                          <div className="h-full bg-foreground/50 rounded-full" style={{ width: "90%" }} />
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">GR Expression</span>
                          <span className="font-mono font-medium">10%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full">
                          <div className="h-full bg-foreground/50 rounded-full" style={{ width: "10%" }} />
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Stress Response</span>
                          <span className="font-mono font-medium">90%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full">
                          <div className="h-full bg-foreground/50 rounded-full" style={{ width: "90%" }} />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Low maternal care leaves heavy methylation on the GR gene promoter.
                        The closed chromatin silences GR expression, resulting in heightened
                        anxiety and poor stress regulation throughout life.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Scrub another capybara pup</span>
                    <Button variant="secondary" onClick={startGame} data-testid="button-restart-from-investigate">
                      GO!
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      <footer className="border-t border-border px-4 py-6" data-testid="footer">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground text-center sm:text-left space-y-1">
              <p>Calm Your Capy - An interactive simulation exploring maternal care and epigenetic programming.
              Based on the research of Meaney & Szyf (2005).</p>
              <p>&copy; University of Utah. All rights reserved. This is an independent, non-commercial fan-made simulation created for educational purposes.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground">Support this project</p>
              <DonationLinks />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
