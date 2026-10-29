import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, ShieldCheck, TrendingUp, Calculator, 
  MessageSquare, BookOpen, ArrowRight, IndianRupee, 
  Wallet, PieChart, Sparkles
} from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';

const Landing = () => {
  const features = [
    { icon: <BrainCircuit className="w-6 h-6 text-primary-500" />, title: "AI Financial Advisor", desc: "Get personalized loan advice and spending insights powered by Groq AI." },
    { icon: <Calculator className="w-6 h-6 text-primary-500" />, title: "Smart EMI Calculator", desc: "Calculate EMIs, view amortization schedules, and check affordability instantly." },
    { icon: <TrendingUp className="w-6 h-6 text-primary-500" />, title: "Health Score", desc: "Track your financial health with our 4-pillar scoring system." },
    { icon: <ShieldCheck className="w-6 h-6 text-primary-500" />, title: "Loan Recommendations", desc: "Rule-based engine to find the best loan options tailored to your income." },
    { icon: <PieChart className="w-6 h-6 text-primary-500" />, title: "Budget Tracker", desc: "Track expenses, categorize spending, and get AI insights on where to save." },
    { icon: <BookOpen className="w-6 h-6 text-primary-500" />, title: "Learning Center", desc: "Master personal finance with our curated, easy-to-understand modules." }
  ];

  const steps = [
    { num: "01", title: "Create Profile", desc: "Sign up and securely input your basic financial details." },
    { num: "02", title: "AI Analysis", desc: "Our AI evaluates your income, expenses, and goals to create a custom plan." },
    { num: "03", title: "Take Action", desc: "Get loan recommendations, budget insights, and start learning." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white transition-colors duration-300 font-sans overflow-x-hidden">
      <LandingNavbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-500 font-medium text-sm mb-6 border border-primary-500/20">
              <Sparkles className="w-4 h-4" /> Powered by Advanced AI
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight text-gray-900          dark:text-white">
                Take Control of <br />
                Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Finances</span> <br /> with AI
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
              Manage loans, track expenses, build budgets, and get personalized financial advice — all in one intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 transform hover:-translate-y-1">
                Start for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex items-center justify-center">
                Explore Features
              </a>
            </div>
          </motion.div>

          {/* Hero Mockup with Floating Animation */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative animate-float">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-[32px] blur opacity-30 dark:opacity-40"></div>
            
            <div className="relative bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-[28px] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Financial Health Score</p>
                  <h3 className="text-4xl font-bold mt-1">85<span className="text-xl text-gray-400">/100</span></h3>
                </div>
                <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-bold border border-green-500/20">Excellent</div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-dark-bg p-4 rounded-xl border border-gray-100 dark:border-dark-border">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Savings</span>
                    <span className="font-bold">₹25,000</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <div className="bg-primary-500/5 dark:bg-primary-500/10 p-4 rounded-xl border border-primary-500/10 flex items-start gap-3">
                  <BrainCircuit className="w-6 h-6 text-primary-500 mt-1" />
                  <div>
                    <p className="text-sm font-semibold mb-1">AI Insight</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your food expenses are 20% higher than last month. Reduce dining out to save ₹2,000.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

            {/* STATS SECTION (Real App Stats) */}
            <section className="py-10 border-y border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card/50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[ 
            { val: "14+", label: "Financial Lessons" }, 
            { val: "5+", label: "Loan Categories" }, 
            { val: "24/7", label: "AI Mentor" }, 
            { val: "100%", label: "Free & Secure" } 
          ].map((stat, i) => (
            <div key={i}>
              <h4 className="text-3xl font-bold text-primary-500 mb-1">{stat.val}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Master Your Money</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Our AI-powered platform combines loan management, budgeting, and financial education into one seamless experience.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white dark:bg-dark-card p-8 rounded-2xl border border-gray-100 dark:border-dark-border hover:border-primary-500/50 transition-colors group cursor-pointer"
              >
                <div className="bg-gray-50 dark:bg-dark-bg w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-dark-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400">Get started in three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gray-200 dark:bg-dark-border -z-10"></div>
            {steps.map((step, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }} className="text-center">
                <div className="w-20 h-20 mx-auto bg-white dark:bg-dark-bg border-4 border-gray-100 dark:border-dark-border rounded-full flex items-center justify-center text-2xl font-bold text-primary-500 mb-6 shadow-xl">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg"><Wallet className="w-4 h-4 text-white" /></div>
            <span className="text-lg font-bold">FinMate AI</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">© 2026 FinMate AI. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-primary-500">Privacy</a>
            <a href="#" className="hover:text-primary-500">Terms</a>
            <a href="#" className="hover:text-primary-500">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;