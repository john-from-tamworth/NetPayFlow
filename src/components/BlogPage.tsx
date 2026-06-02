import React, { useState } from 'react';
import { 
  BookOpen, 
  ArrowLeft, 
  Clock, 
  User, 
  ArrowRight, 
  Flame, 
  Sparkles, 
  Calculator, 
  MapPin, 
  Share2, 
  ThumbsUp, 
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import { CalculatorInputs } from '../types';

interface BlogPageProps {
  onNavigateToTab: (tabId: 'pay-calc' | 'budget' | 'savings-compound' | 'debt-advisor') => void;
  setInputs: (inputs: CalculatorInputs) => void;
  setCompareInputs: (inputs: CalculatorInputs) => void;
  setIsCompareMode: (isCompare: boolean) => void;
  setActiveScenario: (scenario: 'A' | 'B') => void;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: 'Tax Advice' | 'Career & Planning' | 'Wealth Strategy';
  date: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  featuredImage: string;
  content: React.ReactNode;
}

export default function BlogPage({ 
  onNavigateToTab, 
  setInputs, 
  setCompareInputs, 
  setIsCompareMode,
  setActiveScenario
}: BlogPageProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Record<string, boolean>>({});

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedArticles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedArticles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const articles: Article[] = [
    {
      id: 'scotland-vs-ruk-tax',
      title: 'Scotland vs. Rest of UK Income Tax: Why Your Take-Home Changes North of the Border',
      slug: 'scotland-vs-ruk-tax-differences',
      excerpt: 'Did you know Scotland has six progressive Income Tax bands compared to only three in England, Wales, and Northern Ireland? Learn how this impacts your monthly salary slip and how to use pension sacrifice to reclaim lost pay.',
      category: 'Tax Advice',
      date: 'June 2, 2026',
      readTime: '6 min read',
      author: {
        name: 'Aron Sterling',
        role: 'Senior UK Tax Planner',
        avatar: 'AS'
      },
      featuredImage: 'https://images.unsplash.com/photo-1513829096999-4978602297af?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      content: (
        <div className="space-y-6 text-slate-650 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
            If you are relocating, negotiating a remote job contract, or reviewing pay from a Scottish employer, you will quickly notice UK payroll math is not universally identical.
          </p>

          <p>
            While National Insurance contribution rates have been flattened across the entire UK (now sitting at a reduced rate of 8% for basic employees under current budgets!), <strong>Income Tax rules diverge dramatically</strong> once you cross the border into Scotland.
          </p>

          <h3 className="text-sm sm:text-base font-black text-slate-850 dark:text-white pt-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">1</span>
            The core difference: 6 Progressive Bands vs. 3 Flat Bands
          </h3>

          <p>
            HM Revenue &amp; Customs (HMRC) maintains three basic income tax percentages for the land masses of England, Wales, and Northern Ireland:
          </p>
          
          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-850/50 bg-slate-50/50 dark:bg-slate-950/20 p-3 sm:p-4 font-sans space-y-2">
            <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Rest of UK (rUK) HMRC Tax Bands</p>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono font-semibold pt-1">
              <div>Allowance: £0 - £12,570</div>
              <div className="text-center text-emerald-600">0% Rate</div>
              <div className="text-right text-slate-400">Personal Allowance</div>
              
              <div>Basic Rate: £12,571 - £50,270</div>
              <div className="text-center text-indigo-600">20% Rate</div>
              <div className="text-right text-slate-400">Standard Band</div>

              <div>Higher Rate: £50,271 - £125,140</div>
              <div className="text-center text-amber-600 dark:text-amber-500">40% Rate</div>
              <div className="text-right text-slate-400">High Salary Band</div>

              <div>Additional Rate: £125,140+</div>
              <div className="text-center text-rose-600">45% Rate</div>
              <div className="text-right text-slate-400">Top Salary Limit</div>
            </div>
          </div>

          <p>
            Meanwhile, the Scottish Government administers the tax brackets of their residents independently. To protect lower-income workers while generating more revenue for public social programs, Scotland uses a highly progressive 6-tier structure for the 2026/27 fiscal year:
          </p>

          <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-850/50 bg-slate-50/50 dark:bg-slate-950/20 p-3 sm:p-4 font-sans space-y-2">
            <p className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Scottish Government Tax Bands (FY 2026/27)</p>
            <div className="grid grid-cols-3 gap-3 text-[11px] font-mono font-semibold pt-1 border-t border-slate-200/40 dark:border-slate-800">
              <div>£0 - £12,570 (Personal)</div>
              <div className="text-center text-emerald-600">0% Rate</div>
              <div className="text-right text-slate-400">Personal Allowance</div>

              <div>£12,571 - £14,876 (Starter)</div>
              <div className="text-center text-emerald-600">19% Rate</div>
              <div className="text-right text-slate-400">Starter Allowance</div>

              <div>£14,877 - £26,561 (Basic)</div>
              <div className="text-center text-indigo-500">20% Rate</div>
              <div className="text-right text-slate-400">Basic Band</div>

              <div>£26,562 - £44,272 (Intermediate)</div>
              <div className="text-center text-indigo-600">21% Rate</div>
              <div className="text-right text-slate-400">Intermediate Band</div>

              <div>£44,273 - £75,000 (Higher)</div>
              <div className="text-center text-amber-500">42% Rate</div>
              <div className="text-right text-slate-400">Scottish Higher Zone</div>

              <div>£75,001 - £125,140 (Advanced)</div>
              <div className="text-center text-rose-500">45% Rate</div>
              <div className="text-right text-slate-400">Advanced Scottish level</div>

              <div>£125,140+ (Top Rate)</div>
              <div className="text-center text-rose-600 font-bold">48% Rate</div>
              <div className="text-right text-slate-400">Top Rate Limit</div>
            </div>
          </div>

          <h3 className="text-sm sm:text-base font-black text-slate-850 dark:text-white pt-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">2</span>
            The "Scottish Premium": Who Pays More?
          </h3>

          <p>
            If your salary is under <strong>£28,867</strong> per year, Scotland's introduction of the 19% starter rate actually saves you a tiny amount of money (up to £20 annually) compared to rUK rules.
          </p>

          <p>
            However, once you cross the <strong>£28,867 threshold</strong>, you begin paying more tax than those in the rest of the UK. For higher income groups:
          </p>
          
          <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-700 dark:text-slate-300">
            <li>At a gross salary of <strong className="text-slate-900 dark:text-white">£45,000</strong>, a Scottish resident pays roughly <strong className="text-rose-600">£150/year more</strong> in tax due to the 21% intermediate rate and early onset of the 42% higher rate.</li>
            <li>At a gross salary of <strong className="text-slate-900 dark:text-white">£75,000</strong>, the difference surges to approximately <strong className="text-rose-600">£2,100/year more</strong>.</li>
            <li>For high earners pulling in <strong className="text-slate-900 dark:text-white">£150,000</strong>, the Scottish premium jumps to nearly <strong className="text-rose-600">£5,800/year more</strong>.</li>
          </ul>

          <h3 className="text-sm sm:text-base font-black text-slate-850 dark:text-white pt-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">3</span>
            How to Model This Instantly with NetPayFlow
          </h3>

          <p>
            Instead of manually wrestling with conflicting rates files, you can simulate and compare both regions on the fly using NetPayFlow's dual scenario toggle:
          </p>

          <div className="rounded-3xl border border-[#cbd5e1] border-indigo-200 dark:border-indigo-900 bg-indigo-50/15 p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-extrabold text-xs sm:text-sm">
              <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
              <span>Interactive Action: Run Comparison</span>
            </div>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              We have customized a pre-loaded simulation. Click the button below to turn on **Compare Mode** with Scenario A set to a **£65,000 salary in England (rUK)** and Scenario B set to a **£65,000 salary in Scotland**.
            </p>

            <button
              type="button"
              onClick={() => {
                setInputs({
                  grossSalary: 65000,
                  pensionPercent: 5,
                  location: 'rUK',
                  studentLoanPlan: 'none',
                  hasPostgradLoan: false,
                  bikValue: 0,
                  taxCode: '1257L',
                  useCustomTaxCode: false,
                });
                setCompareInputs({
                  grossSalary: 65000,
                  pensionPercent: 5,
                  location: 'Scotland',
                  studentLoanPlan: 'none',
                  hasPostgradLoan: false,
                  bikValue: 0,
                  taxCode: '1257L',
                  useCustomTaxCode: false,
                });
                setIsCompareMode(true);
                setActiveScenario('B');
                onNavigateToTab('pay-calc');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-[11px] font-black transition-all cursor-pointer shadow-sm hover:translate-x-1"
            >
              <Calculator className="h-4 w-4" />
              <span>Load Scottish vs. rUK Comparison</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <h3 className="text-sm sm:text-base font-black text-slate-850 dark:text-white pt-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 text-xs font-bold">✓</span>
            Mitigation Strategy: Utilize Salary Sacrifice
          </h3>
          <p>
            For Scottish residents sitting in the **42% or 45% bands**, workplace pension contributions made via salary sacrifice are incredibly effective. Because you avoid paying high income taxes on sacrificed earnings, every £100 directed to your pension pot may only reduce your physical net take-home cash inflow by **£50 - £56**! It is a premier wealth creation shortcut. Use the pension slider in the left control panel of the Pay Calculator page to experiment with this leverage!
          </p>
        </div>
      )
    },
    {
      id: 'evaluate-pay-rise-offer',
      title: 'Is That New Job Offer Worth It? Calculating the True Value of a Pay Rise',
      slug: 'calculating-true-pay-rise-offer-value',
      excerpt: "Received a counter-offer or looking at a jump to a higher tier? Don't fall for the 'gross' illusion. Between student loan payments, pension bounds, and child benefit clawnbacks, a £12k rise isn't what it seems.",
      category: 'Career & Planning',
      date: 'June 1, 2026',
      readTime: '5 min read',
      author: {
        name: 'Clara Jenkins',
        role: 'Career Financial Consultant',
        avatar: 'CJ'
      },
      featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      content: (
        <div className="space-y-6 text-slate-650 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm sm:text-base">
            Gross paper figures are intoxicating. Moving from £50,000 to £62,000 sounds like a life-changing amount of liquid cash inflows—but the harsh reality is that marginal deductions can destroy over half of that payout before it hits your bank account.
          </p>

          <p>
            When assessing job offers, we frequently fall for the cognitive bias of focusing on the gross change. We calculate "Twelve thousand divided by twelve is a thousand pounds extra per month!". 
          </p>

          <p>
            In reality, crossing HMRC thresholds subjects that exact cash spike to high statutory marginal deductions. Let's break down the hidden friction.
          </p>

          <h3 className="text-sm sm:text-base font-black text-slate-850 dark:text-white pt-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">1</span>
            The Student Loan and National Insurance Trap
          </h3>

          <p>
            If you graduated from a UK college under **Plan 2 (9% repayment)** or have a Postgraduate loan **(6% repayment)**, these deductions sit on top of standard PAYE. Let's analyze a £12,000 raise that pushes your salary past £50,270:
          </p>

          <ul className="list-disc pl-5 space-y-1.5 font-medium text-slate-700 dark:text-slate-300">
            <li>The income tax rate on that specific chunk instantly flips from <strong className="text-slate-950 dark:text-white">20% up to 40%</strong>.</li>
            <li>National Insurance takes <strong className="text-slate-950 dark:text-white">2%</strong>.</li>
            <li>Your Plan 2 Student Loan claims <strong className="text-slate-950 dark:text-white">9%</strong>.</li>
            <li>Your workplace pension sacrifice claims <strong className="text-slate-950">5%</strong> (matched with employer).</li>
          </ul>

          <div className="rounded-2xl border border-rose-200 dark:border-rose-955/40 bg-rose-50/10 p-4 border-l-8 border-l-rose-500">
            <p className="text-xs font-black text-rose-800 dark:text-rose-450 uppercase tracking-wider">The Real Marginal Tax rate:</p>
            <p className="text-xl font-mono font-black text-rose-700 dark:text-rose-450 mt-1">56% Combined Deductions!</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold leading-relaxed">
              Out of your £12,000 salary increase, you only retain **£5,280 in net take-home value** (£440 per month). Over £6,720 is deducted by payroll systems automatically. Knowing this is indispensable context for your salary negotiation!
            </p>
          </div>

          <h3 className="text-sm sm:text-base font-black text-slate-850 dark:text-white pt-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">2</span>
            The Crucial £60k and £100k "Clawback Cliffs"
          </h3>

          <p>
            If you have children or receive tax-free childcare hours, pay rises can activate devastating welfare cliffs:
          </p>
          
          <ul className="list-decimal pl-5 space-y-1.5 font-semibold text-slate-700 dark:text-slate-350">
            <li><strong className="text-slate-900 dark:text-white">The Child Benefit Trap (£60k - £80k)</strong>: For every £200 earned over £60,000, your household loses 1% of its eligible statutory Child Benefit. If you have 2 children, this equates to an effective extra **11.5% marginal deduction**!</li>
            <li><strong className="text-slate-900 dark:text-white">The Personal Allowance Taper Trap (£100k - £125k)</strong>: For earnings over £100,000, HMRC reduces your standard £12,570 Personal Allowance by £1 for every £2 of income. This creates a painful **62% base marginal tax rate** (excl student loans)!</li>
          </ul>

          <h3 className="text-sm sm:text-base font-black text-slate-850 dark:text-white pt-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold">3</span>
            Compare Offers Instantly on NetPayFlow
          </h3>

          <p>
            Do not guess your net pay. NetPayFlow allows you to simulate your exact pay rise scenario side-by-side. 
          </p>

          <p>
            Let's pre-load a simulation tracking a typical pay jump from **£45,000** (with a 5% pension) to a **£58,000 job offer** (negotiated with 8% pension and Plan 1 Student Loan). Click below to see the interactive comparison breakdown:
          </p>

          <div className="rounded-3xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/15 p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-extrabold text-xs sm:text-sm">
              <Sparkles className="h-4.5 w-4.5 text-indigo-505 text-indigo-500 animate-pulse" />
              <span>Simulate Pay Rise Scenario</span>
            </div>
            
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
              We have configured a benchmark pay rise. Click below to load **Compare Mode** with Scenario A as a current moderate salary and Scenario B as the job offer.
            </p>

            <button
              type="button"
              onClick={() => {
                setInputs({
                  grossSalary: 45000,
                  pensionPercent: 5,
                  location: 'rUK',
                  studentLoanPlan: 'Plan 1',
                  hasPostgradLoan: false,
                  bikValue: 0,
                  taxCode: '1257L',
                  useCustomTaxCode: false,
                });
                setCompareInputs({
                  grossSalary: 58000,
                  pensionPercent: 8,
                  location: 'rUK',
                  studentLoanPlan: 'Plan 1',
                  hasPostgradLoan: false,
                  bikValue: 1200, // company car benefit simulator
                  taxCode: '1257L',
                  useCustomTaxCode: false,
                });
                setIsCompareMode(true);
                setActiveScenario('B');
                onNavigateToTab('pay-calc');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-[11px] font-black transition-all cursor-pointer shadow-sm hover:translate-x-1"
            >
              <Calculator className="h-4 w-4" />
              <span>Model Custom Job Offer Comparison</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <h3 className="text-sm sm:text-base font-black text-slate-850 dark:text-white pt-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 text-xs font-bold">✓</span>
            Summary: Countering the cliffs
          </h3>
          <p>
            When offered a pay rise that pushes you into a cliff zone, negotiate for auxiliary **non-taxable benefits** if possible. Requesting a higher employer pension contribution matching percentage, a fully electric green car salary sacrifice lease, extra work-from-home allowances, or extended private health packages is highly tax-efficient compared to flat cash gains! Use NetPayFlow's comparison screen to negotiate with absolute numbers backing you up!
          </p>
        </div>
      )
    }
  ];

  const activeArticle = articles.find(a => a.id === selectedArticleId);

  return (
    <div className="space-y-6">
      
      {/* Editorial Header */}
      {!selectedArticleId ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-950/50 p-2.5 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400">Knowledge Hub</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-905 text-slate-900 dark:text-white mt-0.5">
                Financial Planning Insights &amp; Articles
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                Expand your core wealth intelligence with expert UK salary, progressive tax rules, and budget optimizing articles.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main View Area */}
      {!selectedArticleId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((art) => {
            const isLiked = likedArticles[art.id];
            const isBookmarked = bookmarkedArticles[art.id];
            
            return (
              <div 
                key={art.id}
                onClick={() => setSelectedArticleId(art.id)}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Simulated Article Cover Banner using visual CSS art or Placeholder Image */}
                <div className="h-44 relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
                  <img 
                    src={art.featuredImage} 
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 opacity-90 dark:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/45 to-transparent flex items-end p-4">
                    <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                      {art.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {art.readTime}</span>
                      <span>•</span>
                      <span>{art.date}</span>
                    </div>

                    <h2 className="text-sm sm:text-base font-black text-slate-850 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {art.title}
                    </h2>

                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed font-semibold line-clamp-3">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-850">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-150 dark:bg-slate-800 flex items-center justify-center text-slate-750 dark:text-slate-300 text-[10px] font-black">
                        {art.author.avatar}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-205">{art.author.name}</p>
                        <p className="text-[8px] font-mono text-slate-400">{art.author.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button" 
                        onClick={(e) => handleToggleLike(art.id, e)}
                        className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                          isLiked 
                            ? 'bg-rose-50 border-rose-200 text-rose-650' 
                            : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 text-slate-400 dark:hover:bg-slate-800'
                        }`}
                        title="Like Article"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={(e) => handleToggleBookmark(art.id, e)}
                        className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                          isBookmarked 
                            ? 'bg-amber-50 border-amber-200 text-amber-650' 
                            : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 text-slate-400 dark:hover:bg-slate-800'
                        }`}
                        title="Bookmark Article"
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                      </button>
                      
                      <div className="text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase flex items-center gap-1 pl-1 font-mono group-hover:translate-x-1 transition-transform">
                        <span>Read</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* INDIVIDUAL ARTICLE READER VIEW (Editorial styling & back navigation) */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md animate-in fade-in duration-300 slide-in-from-bottom-2">
          
          {/* Reader Top Action Bar */}
          <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4.5 border-b border-slate-150 border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedArticleId(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-55 hover:bg-slate-100 cursor-pointer transition-all active:scale-97"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Articles</span>
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Article Reader • {activeArticle?.readTime}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6">
            
            {/* Metadata headers */}
            <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-850">
              <span className="inline-block bg-indigo-50 dark:bg-indigo-950/45 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                {activeArticle?.category}
              </span>
              
              <h1 className="text-xl sm:text-3xl font-black text-slate-950 dark:text-white leading-tight">
                {activeArticle?.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                    {activeArticle?.author.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100">{activeArticle?.author.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{activeArticle?.author.role} • {activeArticle?.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={(e) => handleToggleLike(activeArticle!.id, e)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      likedArticles[activeArticle!.id] 
                        ? 'bg-rose-50 border-rose-200 text-rose-600' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>{likedArticles[activeArticle!.id] ? 'Liked!' : 'Like'}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleToggleBookmark(activeArticle!.id, e)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      bookmarkedArticles[activeArticle!.id] 
                        ? 'bg-amber-50 border-amber-200 text-amber-600' 
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>{bookmarkedArticles[activeArticle!.id] ? 'Saved!' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated cover block */}
            {activeArticle?.featuredImage ? (
              <div className="h-56 sm:h-76 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850">
                <img 
                  src={activeArticle.featuredImage} 
                  alt={activeArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* Article Content Render */}
            <article className="prose prose-slate dark:prose-invert max-w-none pt-4">
              {activeArticle?.content}
            </article>

            {/* Footer newsletter / related actions card */}
            <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-slate-50/60 dark:bg-slate-950/20 border border-slate-250 border-slate-220 border-slate-200 dark:border-slate-850 text-center space-y-4">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white tracking-wider">
                  Test This Article's Core Methodology
                </h3>
                <p className="text-[11.5px] max-w-lg mx-auto leading-relaxed text-slate-500 dark:text-slate-400 font-semibold">
                  This entire suite is driven by real UK budgetary formulas (Fiscal 2026/27 rules preloaded). Go back to any calculations page to apply active optimizations and safeguard your hard-earned pay.
                </p>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedArticleId(null)}
                  className="rounded-xl border border-slate-250 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-black text-slate-650 dark:text-slate-350 cursor-pointer transition-all active:scale-97 hover:bg-slate-100"
                >
                  Read Other Article
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('pay-calc')}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-black cursor-pointer transition-all active:scale-97 shadow-xs hover:translate-x-1"
                >
                  Return to Pay Calculator
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
