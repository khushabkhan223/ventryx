import { useState, useEffect } from 'react';
import { 
  ArrowRight, BarChart3, TrendingDown, Target, ShieldAlert,
  Calculator, LineChart, FileText, Activity, Layers, ChevronRight, Zap
} from 'lucide-react';

function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState("up");

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";
      if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
        setScrollDirection(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };
    window.addEventListener("scroll", updateScrollDirection);
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [scrollDirection]);

  return scrollDirection;
}

function SectionHeading({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16 px-4">
      <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">{title}</h2>
      <p className="text-lg md:text-xl text-muted leading-relaxed">{subtitle}</p>
    </div>
  );
}

export default function App() {
  const scrollDirection = useScrollDirection();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-accent selection:text-black">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-secondary/5 blur-[150px]" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
      </div>

      {/* Navigation */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-4' : 'py-6'} ${scrollDirection === 'down' ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-xl tracking-tight">Ventryx</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <a href="#problem" className="hover:text-white transition-colors">The Problem</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="http://localhost:3000/login" className="text-sm font-medium hover:text-accent transition-colors hidden sm:block">Log in</a>
            <a href="http://localhost:3000/signup" className="btn-primary text-sm py-2 px-4">
              Get Started
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20">
        
        {/* 1. Hero Section */}
        <section className="max-w-[1280px] mx-auto px-6 pt-10 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-sm text-accent mb-8 border-accent/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                Ventryx Validation Engine is live
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1] gradient-text">
                Know if your startup idea will survive.
              </h1>
              <p className="text-xl text-muted leading-relaxed mb-10">
                Ventryx simulates revenue, churn, CAC, and growth to produce a brutally honest viability score before you write a single line of code.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="http://localhost:3000/signup" className="btn-primary text-lg px-8 py-4">
                  Analyze an Idea <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4">
                  See Demo
                </a>
              </div>
              
              <div className="mt-12 flex items-center gap-6 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-accent" /> No credit card required
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-card flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs">Trusted by 5,000+ founders</span>
                </div>
              </div>
            </div>

            {/* Hero Dashboard Preview */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-[1.5rem] bg-gradient-to-b from-accent/20 to-transparent blur-xl opacity-50" />
              <div className="glass-card p-6 border-border/50 relative">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-border/50">
                  <div>
                    <h3 className="text-lg font-medium text-white/90">Viability Score</h3>
                    <p className="text-sm text-muted">Project: Prime Analytics SaaS</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-accent">84/100</div>
                      <div className="text-xs text-accent/80 font-medium tracking-wide uppercase">Proceed</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Mock Chart Area */}
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm text-muted">Revenue Projection (M24)</span>
                      <span className="text-lg font-semibold">$142.5K MRR</span>
                    </div>
                    <div className="h-32 rounded-lg bg-card border border-border/50 relative overflow-hidden flex items-end p-2 gap-1">
                      {/* Fake Bars */}
                      {Array.from({length: 24}).map((_, i) => {
                        const height = Math.pow(1.15, i) * 10;
                        return (
                          <div 
                            key={i} 
                            className="flex-1 bg-gradient-to-t from-accent/20 to-accent rounded-sm opacity-80" 
                            style={{ height: `${Math.min(100, height)}%` }}
                          />
                        )
                      })}
                      
                      {/* Breakeven line indicator */}
                      <div className="absolute left-0 right-0 bottom-12 border-t border-dashed border-secondary/50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background/50 rounded-xl p-4 border border-border/30">
                      <div className="text-xs text-muted mb-1 flex items-center gap-1.5"><Target className="w-3.5 h-3.5"/> LTV:CAC Ratio</div>
                      <div className="text-xl font-semibold text-white">4.2x</div>
                      <div className="text-xs text-accent mt-1">Healthy Economics</div>
                    </div>
                    <div className="bg-background/50 rounded-xl p-4 border border-border/30">
                      <div className="text-xs text-muted mb-1 flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5"/> Burn Risk</div>
                      <div className="text-xl font-semibold text-white">Low</div>
                      <div className="text-xs text-secondary mt-1">Breakeven in M8</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* 2. Problem Section */}
        <section id="problem" className="py-24 border-y border-border/50 bg-[#070A14]">
          <SectionHeading 
            title="Most startups fail before they understand their economics." 
            subtitle="Building a product is easy. Building a profitable business is hard. Founders waste years because they didn't run the math." 
          />
          
          <div className="max-w-[1280px] mx-auto px-6 grid md:grid-cols-3 gap-6">
            <div className="glass-card p-8 group hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6">
                <LineChart className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Guessing Projections</h3>
              <p className="text-muted leading-relaxed">Most founders use spreadsheet templates that hide the fatal flaws in their growth assumptions.</p>
            </div>
            
            <div className="glass-card p-8 group hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ignoring CAC</h3>
              <p className="text-muted leading-relaxed">Focusing only on the product while ignoring the skyrocketing costs of acquiring early customers.</p>
            </div>
            
            <div className="glass-card p-8 group hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Running Out of Runway</h3>
              <p className="text-muted leading-relaxed">Realizing too late that the time to profitability is longer than the capital allows.</p>
            </div>
          </div>
        </section>

        {/* 3. How Ventryx Works */}
        <section id="how-it-works" className="py-32 max-w-[1280px] mx-auto px-6">
          <SectionHeading 
            title="Validate efficiently." 
            subtitle="A structured, analytical flow to test your idea." 
          />
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] border-t border-dashed border-border/80 z-0" />
            
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-background border border-border/80 flex items-center justify-center text-xl font-bold mb-6 text-accent shadow-[0_0_15px_rgba(0,255,156,0.1)]">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Describe the Problem</h3>
              <p className="text-muted text-sm px-4">Provide context around the pain point, urgency, and the precision of your target segment.</p>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-background border border-border/80 flex items-center justify-center text-xl font-bold mb-6 text-secondary shadow-[0_0_15px_rgba(92,225,230,0.1)]">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter Assumptions</h3>
              <p className="text-muted text-sm px-4">Input best-guesses for pricing, expected churn, CAC, and monthly traffic volume.</p>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-accent text-black flex items-center justify-center text-xl font-bold mb-6 shadow-glow-accent">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get the Report</h3>
              <p className="text-muted text-sm px-4">Ventryx generates a comprehensive dashboard with financial modeling and AI insights.</p>
            </div>
          </div>
        </section>

        {/* 4. Analytics Preview Section */}
        <section className="py-24 bg-[#070A14] border-y border-border/50 overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1.5 rounded-full border border-border bg-white/5 text-sm font-medium text-secondary mb-4">
                Enterprise-grade Analytics
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">The Data You Need to Decide</h2>
            </div>
            
            <div className="glass-card p-2 md:p-8 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-transparent to-secondary/5 rounded-[1.25rem] pointer-events-none" />
              
              {/* Dashboard Wrapper */}
              <div className="bg-background rounded-2xl border border-border/60 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="border-b border-border/40 p-4 flex items-center justify-between bg-card/50">
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1 rounded bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">PROJECT DASHBOARD</div>
                    <span className="text-sm text-muted font-medium">B2B SaaS Developer Tool</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <div className="w-3 h-3 rounded-full bg-border" />
                  </div>
                </div>
                
                {/* Dashboard Grid */}
                <div className="p-6 grid lg:grid-cols-3 gap-6 relative">
                  
                  {/* Revenue Chart */}
                  <div className="lg:col-span-2 border border-border/40 rounded-xl p-5 bg-card/30">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-semibold text-white/90 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted"/> Cohort Revenue Projection</h4>
                      <select className="bg-background border border-border/50 rounded-lg px-2 py-1 text-xs text-muted">
                        <option>Base Case</option>
                        <option>Pessimistic</option>
                      </select>
                    </div>
                    {/* Abstract Chart Graphic */}
                    <div className="relative h-48 w-full">
                      {/* Lines */}
                      <svg className="w-full h-full text-border/50" preserveAspectRatio="none">
                        <g fill="none" stroke="currentColor" strokeWidth="1">
                          <line x1="0" y1="25%" x2="100%" y2="25%" strokeDasharray="4 4" />
                          <line x1="0" y1="50%" x2="100%" y2="50%" strokeDasharray="4 4" />
                          <line x1="0" y1="75%" x2="100%" y2="75%" strokeDasharray="4 4" />
                        </g>
                      </svg>
                      {/* Data Curve */}
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <path d="M0,192 C100,180 200,130 300,110 C400,90 500,40 800,20 L800,192 L0,192 Z" fill="url(#gradient-accent)" opacity="0.2"/>
                        <path d="M0,192 C100,180 200,130 300,110 C400,90 500,40 800,20" fill="none" stroke="#00FF9C" strokeWidth="3"/>
                        
                        {/* Costs Curve */}
                        <path d="M0,100 C200,110 400,120 800,135" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="6 6"/>
                        
                        <defs>
                          <linearGradient id="gradient-accent" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00FF9C" />
                            <stop offset="100%" stopColor="transparent" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {/* Breakeven Marker */}
                      <div className="absolute left-[38%] top-0 bottom-0 border-l border-secondary w-px">
                        <div className="absolute top-4 -translate-x-1/2 bg-secondary/20 text-secondary text-[10px] px-2 py-0.5 rounded border border-secondary/30 whitespace-nowrap">
                          Breakeven (M8)
                        </div>
                        <div className="absolute top-[110px] left-[-4px] w-2 h-2 bg-background border-2 border-secondary rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Stats */}
                  <div className="space-y-6">
                    <div className="border border-border/40 rounded-xl p-5 bg-card/30">
                      <h4 className="text-secondary text-xs font-semibold tracking-wider uppercase mb-1">Unit Economics</h4>
                      <div className="mt-4 flex flex-col gap-4">
                        <div>
                          <div className="text-xs text-muted mb-1">Lifetime Value (LTV)</div>
                          <div className="text-xl font-bold">$1,250</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted mb-1">Acquisition Cost (CAC)</div>
                          <div className="text-xl font-bold">$340</div>
                        </div>
                        <div className="pt-3 border-t border-border/50">
                          <div className="flex justify-between items-end">
                            <span className="text-xs text-muted">LTV:CAC Ratio</span>
                            <span className="text-accent font-bold">3.6x</span>
                          </div>
                          <div className="h-1.5 w-full bg-background mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-accent" style={{width: '75%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-border/40 rounded-xl p-5 bg-card/30">
                      <h4 className="text-muted text-xs font-semibold tracking-wider uppercase mb-4">Risk Factors</h4>
                      <div className="space-y-3 focus:outline-none">
                        <div className="flex items-start gap-3 p-2 rounded bg-orange-500/10 border border-orange-500/20">
                          <ShieldAlert className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-medium text-orange-400">Moderate Churn Risk</div>
                            <div className="text-[10px] text-muted leading-tight mt-1">Expected 5% monthly churn limits long-term growth.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Features Section */}
        <section id="features" className="py-24 max-w-[1280px] mx-auto px-6">
          <SectionHeading 
            title="Everything required to validate." 
            subtitle="Stop guessing. Base your next startup on rigid business modeling." 
          />
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-8 group">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 border border-accent/20">
                <Calculator className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Financial Simulation</h3>
              <p className="text-muted leading-relaxed">Advanced cohort-based model predicting revenue growth against customer acquisition channels and fixed burn rates.</p>
            </div>
            
            <div className="glass-card p-8 group">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 border border-secondary/20">
                <Layers className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Unit Economics Analysis</h3>
              <p className="text-muted leading-relaxed">Understand if acquiring customers is sustainable. Instant comparison between LTV, CAC, and break-even timelines.</p>
            </div>

            <div className="glass-card p-8 group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Scenario Comparison</h3>
              <p className="text-muted leading-relaxed">Easily toggle between base case and pessimistic assumptions to stress-test your business model under difficult market conditions.</p>
            </div>

            <div className="glass-card p-8 group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Executive Memo</h3>
              <p className="text-muted leading-relaxed">Instant generation of an experienced executive-level qualitative analysis synthesizing the numbers into actionable business advice.</p>
            </div>
          </div>
        </section>

        {/* 6. Executive Memo Section */}
        <section className="py-24 max-w-[1280px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1 glass-card p-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-secondary/10 blur-[50px]" />
              
              <div className="border-b border-border/50 pb-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-secondary" />
                  <span className="font-semibold text-sm">AI Executive Memo</span>
                </div>
                <span className="text-xs text-muted border border-border px-2 py-1 rounded bg-background/50">Auto-generated</span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Executive Summary</h4>
                  <p className="text-sm leading-relaxed text-white/90">
                    Unit economics appear highly viable with an expected LTV significantly exceeding CAC. The problem definition is strong, indicating a market with high willingness to pay.
                  </p>
                </div>
                
                <div className="pl-4 border-l-2 border-orange-500/50">
                  <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">Primary Risk</h4>
                  <p className="text-sm leading-relaxed text-white/90">
                    Customer churn above 6% could significantly reduce long-term profitability. Furthermore, the competitive distribution channel relies heavily on unproven paid ads.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">Recommendation</h4>
                  <p className="text-sm leading-relaxed font-medium bg-accent/10 border border-accent/20 rounded-lg p-3 text-accent inline-block">
                    Proceed with early validation before scaling acquisition.
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">Board-level insights in seconds.</h2>
              <p className="text-lg text-muted leading-relaxed mb-8">
                Ventryx acts as an experienced CFO and Lead Strategist, analyzing your inputs to return an Executive Memo detailing strengths, severe risks, and a bottom-line recommendation.
              </p>
              <ul className="space-y-4">
                {[
                  "Identifies your weakest assumptions immediately.",
                  "Pinpoints exact unit economic failures.",
                  "Recommends specific, cheap 14-day validation experiments."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                      <ChevronRight className="w-3 h-3 text-secondary" />
                    </div>
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </section>

        {/* 7. Final CTA Section */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent pointer-events-none" />
          <div className="max-w-[800px] mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Test your startup idea before you waste months.</h2>
            <p className="text-xl text-muted mb-10 max-w-2xl mx-auto">
              Run the numbers, see the risks, and get a data-driven validation report for your next big idea today.
            </p>
            <a href="http://localhost:3000/signup" className="btn-primary text-lg px-8 py-4 inline-flex shadow-glow-accent">
              Try Ventryx Now <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>

      </main>

      {/* 8. Footer */}
      <footer className="border-t border-border/50 bg-background pt-12 pb-8">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            <span className="font-bold text-lg tracking-tight">Ventryx</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-muted">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="http://localhost:3000/signup" className="hover:text-white transition-colors">Demo</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 mt-8 pt-8 border-t border-border/30 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} Ventryx. All rights reserved. Built for pragmatic founders.
        </div>
      </footer>
    </div>
  );
}
