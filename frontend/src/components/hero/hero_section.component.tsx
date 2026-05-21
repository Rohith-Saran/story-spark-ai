import { Link } from "react-router-dom";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import NavListComponent from "./nav_list.component";

const HeroSectionComponent = () => {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const nextStarId = useRef(1);
  const starTimers = useRef<number[]>([]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = nextStarId.current++;
    const size = 8 + Math.floor(Math.random() * 8);

    setStars((prev) => {
      const next = [...prev, { id, x, y, size }];
      return next.slice(-18);
    });

    const timerId = window.setTimeout(() => {
      setStars((prev) => prev.filter((star) => star.id !== id));
      starTimers.current = starTimers.current.filter((timer) => timer !== timerId);
    }, 650);
    starTimers.current.push(timerId);
  };

  useEffect(() => {
    return () => {
      starTimers.current.forEach((timerId) => window.clearTimeout(timerId));
      starTimers.current = [];
    };
  }, []);

  return (
<<<<<<< HEAD
    <div className="relative min-h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -z-10" />

      <NavListComponent
        setShowNotification={setShowNotification}
        newNotify={notifications.length}
      />

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-md mb-8 shadow-sm cursor-pointer hover:bg-slate-700/50 transition-colors">
          <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="text-sm font-semibold text-slate-300 tracking-wide">StorySparkAI v2.0 is live</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Ignite Your Imagination With <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm pb-2">
            AI-Driven Storytelling
          </span>
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed mb-10">
          Create, edit, and generate engaging multiple story variations from a single prompt. 
          Perfect for writers, creators, and enthusiasts exploring the future of fiction.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/stories" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95 flex items-center justify-center gap-2 group">
              Start Writing for Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </Link>
          <Link to="/explore" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-800/60 backdrop-blur-md border border-slate-700/50 hover:bg-slate-700/60 text-slate-200 rounded-xl font-bold text-lg transition-all duration-300 active:scale-95 flex items-center justify-center gap-2">
              Explore Stories
            </button>
          </Link>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature Card 1 */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 group cursor-pointer">
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors">
              <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-3">Infinite Variations</h3>
            <p className="text-slate-400 leading-relaxed">
              Generate multiple unique branches of your story from a single starting prompt. Explore every creative possibility.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 group cursor-pointer">
            <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/30 transition-colors">
              <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-3">AI Co-Writer</h3>
            <p className="text-slate-400 leading-relaxed">
              Stuck on a paragraph? Let our advanced AI models suggest the next perfect sentence to keep your momentum going.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 group cursor-pointer">
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-colors">
              <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-3">Community Driven</h3>
            <p className="text-slate-400 leading-relaxed">
              Publish your stories, gather likes, and interact with other creators in a thriving, collaborative ecosystem.
            </p>
          </div>
=======
    <div className="gradient-bg min-h-screen flex flex-col">
      <div className="relative overflow-hidden flex-grow" onMouseMove={handleMouseMove}>
        <div 
          className="relative z-10 mx-auto max-w-7xl px-6 pb-24 text-center"
          style={{ paddingTop: 'calc(var(--header-height) + 3.5rem)' }}
        >
          <div className="inline-flex items-center justify-center mx-auto px-4 py-1.5 mb-8 rounded-full bg-opacity-10 border border-white/20 opacity-80 bg-blue-500/20 text-white">
            <span className="text-sm font-medium">
              NEW TEXT TO STORY GENERATION
            </span>
            <span className="ml-2 text-sm font-semibold">
              {" "}
              AI <i className="fa-solid fa-wand-sparkles"></i>
            </span>
          </div>
          <h1 className="mx-auto max-w-5xl text-5xl sm:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-500 to-slate-900 mb-8 tracking-tight leading-tight">
            Unleash Your
            <br />
            Imagination with AI-Generated Stories!
            <span className="inline-block ml-4 align-middle">
              <i className="fas fa-bolt text-yellow-400 glow"></i>
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Transform your ideas into captivating narratives with just a simple
            prompt. Whether it's fantasy, mystery, or sci-fi — let your
            creativity flow effortlessly.
          </p>
>>>>>>> upstream/main

        </div>
<<<<<<< HEAD
=======
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="hero-cursor-stars absolute inset-0" aria-hidden="true">
            <style>{
              stars
                .map(
                  (star) =>
                    `.hero-cursor-star-${star.id} { left: ${star.x}px; top: ${star.y}px; width: ${star.size}px; height: ${star.size}px; }`
                )
                .join(" ")
            }</style>
            {stars.map((star) => (
              <span
                key={star.id}
                className={`hero-cursor-star hero-cursor-star-${star.id} ${star.size > 12 ? "hero-cursor-star-large" : ""}`}
              />
            ))}
          </div>
          <div className="hero-3d-scene absolute inset-0" aria-hidden="true">
            <div className="hero-3d-card left-[8%] top-[30%]"></div>
            <div className="hero-3d-card hero-3d-card-secondary left-[18%] top-[62%]"></div>
            <div className="hero-3d-ring left-[65%] top-[18%]"></div>
            <div className="hero-3d-orb left-[72%] top-[62%]"></div>
            <div className="hero-3d-cube left-[55%] top-[42%]"></div>
            <div className="hero-3d-frame left-[42%] top-[74%]"></div>
            <div className="hero-3d-shard left-[28%] top-[22%]"></div>
            <div className="hero-3d-glint left-[12%] top-[15%]"></div>
            <div className="hero-3d-reading left-[50%] top-[34%]">
              <div className="hero-3d-reading-glow"></div>
              <div className="hero-3d-reading-head"></div>
              <div className="hero-3d-reading-torso"></div>
              <div className="hero-3d-reading-book"></div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-custom/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-[-200px] left-[250px] w-[800px] h-[350px] bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
        {/* <div className="absolute top-[-200px] right-[100px] w-[500px] h-[400px] bg-pink-500/20 rounded-full blur-3xl -z-10"></div> */}
>>>>>>> upstream/main
      </div>

    </div>
  );
};

export default HeroSectionComponent;
