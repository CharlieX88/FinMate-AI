import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  BookOpen, Clock, CheckCircle2, ChevronRight, ChevronDown, ChevronUp,
  Award, Target, ArrowLeft, ShieldCheck, Check,
  Lightbulb, AlertTriangle, ExternalLink
} from 'lucide-react';

// Custom Markdown Components for Tip/Warning boxes (Crash-proof)
const MarkdownComponents = {
  blockquote: ({ children }) => {
    // Convert children to string to check for TIP or WARNING
    const childrenString = React.Children.toArray(children).map(child => {
      if (typeof child === 'string') return child;
      if (child.props && child.props.children) {
        return React.Children.toArray(child.props.children).map(c => 
          typeof c === 'string' ? c : (c.props?.children || '')
        ).join('');
      }
      return '';
    }).join('');

    if (childrenString.includes('TIP:')) {
      return (
        <div className="my-6 bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-xl flex gap-3 text-blue-700 dark:text-blue-300">
          <Lightbulb className="w-6 h-6 shrink-0 text-blue-500" />
          <div className="font-medium text-sm leading-relaxed">{children}</div>
        </div>
      );
    }
    if (childrenString.includes('WARNING:')) {
      return (
        <div className="my-6 bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded-r-xl flex gap-3 text-orange-700 dark:text-orange-300">
          <AlertTriangle className="w-6 h-6 shrink-0 text-orange-500" />
          <div className="font-medium text-sm leading-relaxed">{children}</div>
        </div>
      );
    }
    return <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 dark:text-gray-400">{children}</blockquote>;
  }
};

const LearnCenter = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({ completedSlugs: [], percent: 0, completedCount: 0 });
  
  const [expandedModule, setExpandedModule] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null); 
  const [loadingLesson, setLoadingLesson] = useState(false); // 👈 Loading state for single lesson
  
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [lessonsRes, progressRes] = await Promise.all([
        api.get('/lessons'),
        api.get('/lessons/progress/me')
      ]);
      setLessons(lessonsRes.data.lessons || []);
      setProgressData(progressRes.data || { completedSlugs: [], percent: 0, completedCount: 0 });
      
      if (lessonsRes.data.lessons?.length > 0 && !expandedModule) {
        setExpandedModule(lessonsRes.data.lessons[0].module || 'Module 1: Financial Foundations');
      }
    } catch (error) {
      console.error("Failed to fetch learn data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLessonClick = async (slug) => {
    setLoadingLesson(true);
    try {
      const res = await api.get(`/lessons/${slug}`);
      if (res.data && res.data.lesson) {
        setActiveLesson(res.data.lesson);
        setMcqAnswers({});
        setShowQuizResult(false);
        window.scrollTo(0, 0);
      } else {
        alert("Invalid lesson data received.");
      }
    } catch (error) {
      alert("Failed to load lesson.");
    } finally {
      setLoadingLesson(false);
    }
  };

  const handleMcqSelect = (qIndex, oIndex) => {
    setMcqAnswers({ ...mcqAnswers, [qIndex]: oIndex });
  };

  const handleMarkComplete = async () => {
    const mcqs = activeLesson.mcqs || [];
    if (mcqs.length > 0) {
       setShowQuizResult(true);
       if (Object.keys(mcqAnswers).length < mcqs.length) return; 
    }
    setIsSubmitting(true);
    try {
      await api.post(`/lessons/${activeLesson.slug}/complete`);
      
      const newCompleted = [...new Set([...(progressData.completedSlugs || []), activeLesson.slug])];
      const newPercent = lessons.length > 0 ? Math.round((newCompleted.length / lessons.length) * 100) : 0;
      
      setProgressData(prev => ({
        ...prev,
        completedSlugs: newCompleted,
        completedCount: newCompleted.length,
        percent: newPercent
      }));
      
      setTimeout(() => setActiveLesson(null), 1000);
    } catch (error) {
      alert("Failed to mark complete.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = [...new Set(lessons.map(l => l.module || 'Module 1: Financial Foundations'))].sort();

  // --- RENDER FULL PAGE READER ---
  if (loadingLesson) {
    return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (activeLesson) {
    const isCompleted = (progressData.completedSlugs || []).includes(activeLesson.slug);
    const keyTakeaways = activeLesson.keyTakeaways || [];
    const mcqs = activeLesson.mcqs || [];
    const externalLinks = activeLesson.externalLinks || [];

    return (
      <div className="max-w-4xl mx-auto pb-20 relative">
        <div className="sticky top-0 z-20 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md py-4 border-b border-gray-100 dark:border-dark-border mb-8 flex justify-between items-center">
          <button onClick={() => setActiveLesson(null)} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Modules
          </button>
          {isCompleted ? (
            <span className="flex items-center gap-1 text-sm font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full"><CheckCircle2 className="w-4 h-4"/> Completed</span>
          ) : (
            <button 
              onClick={handleMarkComplete} disabled={isSubmitting}
              className="bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <CheckCircle2 className="w-4 h-4" />}
              {isSubmitting ? 'Saving...' : showQuizResult ? 'Finish Lesson' : (mcqs.length > 0 ? 'Submit Quiz' : 'Mark Complete')}
            </button>
          )}
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-primary-600 bg-primary-500/10 px-3 py-1 rounded-full uppercase tracking-wider">{activeLesson.category}</span>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-dark-bg px-3 py-1 rounded-full uppercase tracking-wider">{activeLesson.difficulty}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">{activeLesson.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4"/> {activeLesson.duration} min read</span>
          </div>
        </div>

        {/* Safe rendering of content */}
        <div className="prose prose-slate dark:prose-invert lg:prose-lg max-w-none 
          prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-p:leading-relaxed prose-li:my-2 prose-strong:text-primary-600 dark:prose-strong:text-primary-400
          prose-ul:list-disc prose-ul:pl-6">
          {activeLesson.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
              {activeLesson.content}
            </ReactMarkdown>
          ) : (
            <p className="text-gray-500 italic">Content not available for this lesson.</p>
          )}
        </div>

        {/* Takeaways */}
        {keyTakeaways.length > 0 && (
          <div className="mt-12 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-500/10 dark:to-blue-500/5 p-6 md:p-8 rounded-3xl border border-primary-100 dark:border-primary-500/20">
            <h4 className="text-xl font-bold text-primary-900 dark:text-primary-300 mb-5 flex items-center gap-2">
              <Target className="w-6 h-6" /> Key Takeaways
            </h4>
            <ul className="space-y-4">
              {keyTakeaways.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-primary-800 dark:text-primary-200 font-medium">
                  <Check className="w-5 h-5 mt-0.5 shrink-0 text-primary-500" /> <span className="text-base">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* MCQs */}
        {mcqs.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-200 dark:border-dark-border">
            <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Test Your Knowledge</h4>
            <p className="text-gray-500 mb-8">Answer these questions to complete the lesson.</p>
            
            <div className="space-y-8">
              {mcqs.map((mcq, qIndex) => (
                <div key={qIndex} className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-dark-border shadow-sm">
                  <p className="font-bold text-gray-900 dark:text-white mb-6 text-lg">
                    <span className="text-primary-500 mr-2">Q{qIndex + 1}.</span> {mcq.question}
                  </p>
                  <div className="space-y-3">
                    {(mcq.options || []).map((option, oIndex) => {
                      const isSelected = mcqAnswers[qIndex] === oIndex;
                      const isCorrect = mcq.correctAnswerIndex === oIndex;
                      const isWrong = isSelected && !isCorrect;

                      let optionClass = "border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg";
                      if (showQuizResult) {
                        if (isCorrect) optionClass = "bg-green-500/10 border-green-500 text-green-700 dark:text-green-400 ring-2 ring-green-500/50";
                        else if (isWrong) optionClass = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 ring-2 ring-red-500/50";
                        else optionClass = "border-gray-200 dark:border-dark-border opacity-50";
                      } else if (isSelected) {
                        optionClass = "bg-primary-500/10 border-primary-500 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500";
                      }

                      return (
                        <label key={oIndex} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${optionClass}`}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300 dark:border-gray-600'}`}>
                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                          </div>
                          <span className="font-medium text-sm md:text-base">{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Links */}
        {externalLinks.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-dark-border">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Want to learn more?</h4>
            <p className="text-gray-500 mb-6 text-sm">Hand-picked resources from trusted sources.</p>
            <div className="grid gap-4">
              {externalLinks.map((link, idx) => (
                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl hover:border-primary-500 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-600">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{link.title}</h5>
                      <p className="text-xs text-gray-500 mt-1">{link.source}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- RENDER MODULE LIST (Default View) ---
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Path</h1>
            <p className="text-gray-500 text-sm mt-1">Master your finances — from basics to advanced wealth creation.</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-blue-500 shrink-0" />
        <div>
          <h4 className="font-bold text-blue-900 dark:text-blue-300">Complete the modules in order</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">Start from Foundations and move upward. Each lesson includes real examples, quizzes, and external links to RBI, SEBI, and other trusted financial authorities.</p>
        </div>
      </div>

      {/* Modules Accordion */}
      {loading ? (
         <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="space-y-4">
          {modules.map((moduleName, index) => {
            const moduleLessons = lessons.filter(l => (l.module || 'Module 1: Financial Foundations') === moduleName);
            const isExpanded = expandedModule === moduleName;
            const completedInModule = moduleLessons.filter(l => (progressData.completedSlugs || []).includes(l.slug)).length;
            const percent = moduleLessons.length > 0 ? Math.round((completedInModule / moduleLessons.length) * 100) : 0;
            
            const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500'];
            const color = colors[index % colors.length];

            return (
              <div key={moduleName} className={`bg-white dark:bg-dark-card rounded-2xl border transition-all ${isExpanded ? 'border-primary-500/50 shadow-md' : 'border-gray-200 dark:border-dark-border hover:border-gray-300'}`}>
                {/* Module Header */}
                <button 
                  onClick={() => setExpandedModule(isExpanded ? null : moduleName)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{moduleName}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-dark-bg px-2 py-0.5 rounded text-gray-500">MODULE {index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-500">{moduleLessons[0]?.description || 'Start learning this module.'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{completedInModule} / {moduleLessons.length}</p>
                      <p className={`text-xs font-bold ${percent === 100 ? 'text-green-500' : 'text-primary-500'}`}>{percent}%</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>

                {/* Lessons List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gray-100 dark:border-dark-border">
                      <div className="p-4 space-y-2">
                        {moduleLessons.map((lesson, idx) => {
                          const isCompleted = (progressData.completedSlugs || []).includes(lesson.slug);
                          return (
                            <div 
                              key={lesson._id}
                              onClick={() => handleLessonClick(lesson.slug)}
                              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg/50 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-dark-card hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-dark-border transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isCompleted ? 'bg-green-500/10 text-green-500' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}>
                                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                </div>
                                <div>
                                  <h4 className={`font-bold transition-colors ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200 group-hover:text-primary-600'}`}>
                                    {lesson.title}
                                  </h4>
                                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {lesson.duration} min</span>
                                    <span className="uppercase text-[9px] font-bold tracking-wider px-1.5 py-0.5 border border-gray-200 dark:border-gray-700 rounded">{lesson.difficulty}</span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500" />
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LearnCenter;