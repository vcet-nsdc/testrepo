"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, ChevronRight, Lightbulb, CheckCircle2, 
  ShieldAlert, Zap, Thermometer, Droplets, Battery, 
  Sun, Cpu, Settings, Factory, Shield, Leaf, 
  TrendingUp, Users, Link as LinkIcon
} from "lucide-react";

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? prev : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? prev : prev - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const totalSlides = 6;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl aspect-[16/9] bg-white shadow-2xl rounded-lg overflow-hidden relative flex flex-col font-sans">
        
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 border-2 border-slate-300 rounded-full px-6 py-2">
            <Cpu className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-800 tracking-wider">SolveX</span>
          </div>
          <div className="flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-orange-500 fill-orange-500" />
            <div className="text-right">
              <h1 className="text-xl font-bold text-slate-800 leading-tight">SMART INDIA</h1>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">HACKATHON 2026</h1>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 relative overflow-hidden">
          
          {/* Slide 1: Title Slide */}
          <div className={`absolute inset-0 transition-opacity duration-500 p-12 flex flex-col items-center justify-center ${currentSlide === 0 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-50 rounded-full blur-3xl -z-10"></div>
            <h2 className="text-5xl font-extrabold text-center text-slate-900 mb-4 tracking-tight">
              SOLAR-POWERED SMART MINI COLD STORAGE
            </h2>
            
            <div className="mt-12 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-slate-100 max-w-3xl w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-lg">
                <div className="flex flex-col">
                  <span className="text-slate-500 font-semibold text-sm uppercase">Problem Statement ID</span>
                  <span className="text-slate-900 font-bold">SIH26005</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 font-semibold text-sm uppercase">PS Category</span>
                  <span className="text-slate-900 font-bold">Hardware</span>
                </div>
                <div className="flex flex-col md:col-span-2">
                  <span className="text-slate-500 font-semibold text-sm uppercase">Problem Statement Title</span>
                  <span className="text-slate-900 font-bold">Solar-Powered Smart Mini Cold Storage System for Fresh Vegetables in NER</span>
                </div>
                <div className="flex flex-col md:col-span-2">
                  <span className="text-slate-500 font-semibold text-sm uppercase">Theme</span>
                  <span className="text-slate-900 font-bold">Agriculture, FoodTech & Rural Development</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 font-semibold text-sm uppercase">Team ID</span>
                  <span className="text-slate-900 font-bold">[TEAM ID]</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 font-semibold text-sm uppercase">Team Name</span>
                  <span className="text-slate-900 font-bold">SolveX</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2: Proposed Solution */}
          <div className={`absolute inset-0 transition-opacity duration-500 p-10 ${currentSlide === 1 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b-4 border-blue-600 inline-block pb-2">MINI COLD STORAGE SYSTEM</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[60%]">
              {/* Box 1 */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                <div className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Proposed Solution</h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Compact, modular, weather-resistant mini cold store for fresh vegetables.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Insulated chamber + Peltier cooling + fan; ESP32 control with temperature/humidity sensing.</span>
                  </li>
                </ul>
              </div>

              {/* Box 2 */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                <div className="bg-blue-500 text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Factory className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">How it addresses the problem</h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span>Deploy at village centres, farm-gate points, cooperatives and local markets.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span>Alerts for temperature, humidity, power failure and unsafe storage conditions.</span>
                  </li>
                </ul>
              </div>

              {/* Box 3 */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-700"></div>
                <div className="bg-blue-700 text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Innovation & Uniqueness</h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                    <span>Off-grid solar + battery backup for remote NER and unreliable electricity.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                    <span>Energy-aware control uses current/voltage feedback for cooling and battery safety.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Slide 3: Technical Approach */}
          <div className={`absolute inset-0 transition-opacity duration-500 p-10 ${currentSlide === 2 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b-4 border-blue-600 inline-block pb-2">TECHNICAL APPROACH</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <Cpu className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-slate-800">Technologies to be used</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <Thermometer className="w-6 h-6 text-orange-500 shrink-0" />
                    <span className="text-slate-700 font-medium">ESP32 | temperature sensor | humidity sensor | current/voltage sensor | display | Wi-Fi</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <Sun className="w-6 h-6 text-yellow-500 shrink-0" />
                    <span className="text-slate-700 font-medium">Solar panel | battery | Peltier cooler | fan | relay/MOSFET | insulated chamber</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
                    <span className="text-slate-700 font-medium">Optional camera | CO₂ sensor; Arduino C/C++; local status logging.</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 relative">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-slate-800">Implementation Flow</h3>
                </div>
                
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-blue-300 before:to-transparent">
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Battery className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                      <p className="text-sm text-slate-700 font-semibold">Solar panel → charger → battery → regulated DC bus</p>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                      <p className="text-sm text-slate-700 font-semibold">Sensors → ESP32 → relay/MOSFET → Peltier cooler + fan</p>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                      <p className="text-sm text-slate-700 font-semibold">ESP32 → Wi-Fi alerts; display → local storage status</p>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-slate-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                      <p className="text-sm text-slate-700 font-semibold">Prototype → NER climate test → cooperative pilot → hardening</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Slide 4: Feasibility and Viability */}
          <div className={`absolute inset-0 transition-opacity duration-500 p-10 ${currentSlide === 3 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b-4 border-blue-600 inline-block pb-2">FEASIBILITY AND VIABILITY</h2>
            
            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
              {/* Section 1 */}
              <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-blue-600 w-2 shrink-0"></div>
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-blue-900 mb-3 uppercase flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Analysis of Feasibility
                  </h3>
                  <ul className="space-y-2 text-slate-700 font-medium">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                      <span>Low-cost, modular and locally serviceable hardware.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                      <span>Compact chamber suits village clusters and hilly terrain.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                      <span>Closed-loop hysteresis control; battery backup for outages and low sun.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 2 */}
              <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ml-8 relative">
                <div className="absolute top-1/2 -left-8 w-8 h-0.5 bg-slate-300"></div>
                <div className="absolute -left-9 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400"></div>
                
                <div className="bg-red-500 w-2 shrink-0"></div>
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-red-900 mb-3 uppercase flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Potential Challenges and Risks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold border border-slate-200">Monsoon humidity</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold border border-slate-200">Heat</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold border border-slate-200">Low sunlight</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold border border-slate-200">Condensation</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold border border-slate-200">Terrain access</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold border border-slate-200">Battery safety</span>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ml-16 relative">
                <div className="absolute top-1/2 -left-16 w-16 h-0.5 bg-slate-300"></div>
                
                <div className="bg-emerald-500 w-2 shrink-0"></div>
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-emerald-900 mb-3 uppercase flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Strategies to Overcome Challenges
                  </h3>
                  <ul className="space-y-2 text-slate-700 font-medium">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                      <span>Weatherproof insulation + vapor barrier; heat-sink airflow.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                      <span>Sensor calibration + alerts; BMS, fuse and state-of-charge cutoff.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                      <span>Manual override, modular spares and cooperative training.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 5: Impact and Benefits */}
          <div className={`absolute inset-0 transition-opacity duration-500 p-10 ${currentSlide === 4 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b-4 border-blue-600 inline-block pb-2">IMPACT AND BENEFITS</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              {/* Left Column: Target Audience */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-slate-800">Target Audience Impact</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Direct Beneficiaries</h4>
                      <p className="text-slate-600 text-sm mt-1">Small/marginal farmers, farmer groups, cooperatives, and local vendors.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Factory className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Deployment Areas</h4>
                      <p className="text-slate-600 text-sm mt-1">Village collection centres and remote agricultural clusters across NER.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Value Proposition</h4>
                      <p className="text-slate-600 text-sm mt-1">Nearby temporary buffer providing longer freshness and fewer distress sales.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex flex-col items-center text-center justify-center">
                  <Leaf className="w-10 h-10 text-emerald-600 mb-4" />
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Environmental</h4>
                  <p className="text-sm text-slate-600">Less vegetable waste + renewable energy usage.</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col items-center text-center justify-center">
                  <TrendingUp className="w-10 h-10 text-blue-600 mb-4" />
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Economic</h4>
                  <p className="text-sm text-slate-600">Protected inventory + better market access + stronger income.</p>
                </div>
                
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 flex flex-col items-center text-center justify-center">
                  <Users className="w-10 h-10 text-purple-600 mb-4" />
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Social</h4>
                  <p className="text-sm text-slate-600">Affordable cold chain for remote rural and hilly communities.</p>
                </div>
                
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 flex flex-col items-center text-center justify-center">
                  <Factory className="w-10 h-10 text-amber-600 mb-4" />
                  <h4 className="font-bold text-slate-800 text-lg mb-2">Scalable</h4>
                  <p className="text-sm text-slate-600 font-semibold">Farm-gate → Market → Aggregation points.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 6: References */}
          <div className={`absolute inset-0 transition-opacity duration-500 p-10 flex flex-col ${currentSlide === 5 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 border-b-4 border-blue-600 inline-block pb-2">RESEARCH AND REFERENCES</h2>
            
            <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-2xl p-8 overflow-y-auto">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Reference and Research Work
              </h3>
              
              <ul className="space-y-6">
                <li className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-blue-50">
                  <h4 className="font-bold text-slate-800 text-lg">FAO</h4>
                  <p className="text-slate-700 mt-1">The State of Food and Agriculture: Reducing Food Loss and Waste</p>
                  <a href="https://www.fao.org/publications/sofa/2019/en/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2">
                    <LinkIcon className="w-4 h-4" /> https://www.fao.org/publications/sofa/2019/en/
                  </a>
                </li>

                <li className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-blue-50">
                  <h4 className="font-bold text-slate-800 text-lg">Espressif</h4>
                  <p className="text-slate-700 mt-1">ESP32 Series Datasheet</p>
                  <a href="https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2">
                    <LinkIcon className="w-4 h-4" /> esp32_datasheet_en.pdf
                  </a>
                </li>

                <li className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-blue-50">
                  <h4 className="font-bold text-slate-800 text-lg">Adafruit</h4>
                  <p className="text-slate-700 mt-1">DHT Sensor Guide</p>
                  <a href="https://learn.adafruit.com/dht" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2">
                    <LinkIcon className="w-4 h-4" /> https://learn.adafruit.com/dht
                  </a>
                </li>

                <li className="bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-blue-50">
                  <h4 className="font-bold text-slate-800 text-lg">U.S. Department of Energy</h4>
                  <p className="text-slate-700 mt-1">Solar Photovoltaic Cell Basics</p>
                  <a href="https://www.energy.gov/energysaver/solar-photovoltaic-cell-basics" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2">
                    <LinkIcon className="w-4 h-4" /> solar-photovoltaic-cell-basics
                  </a>
                </li>
                
                <li className="bg-blue-600 text-white p-4 rounded-xl shadow-md mt-8">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" />
                    Prototype Basis
                  </h4>
                  <p className="text-blue-50 mt-1">Component list supplied by the team; field values will be validated during the pilot.</p>
                </li>
              </ul>
            </div>
          </div>
          
        </main>

        {/* Footer */}
        <footer className="bg-blue-700 text-white p-4 flex justify-between items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex gap-4">
            <button 
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="p-2 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <div className="text-blue-100 font-medium">
            Slide {currentSlide + 1} of {totalSlides}
          </div>
          <div className="text-sm text-blue-200 hidden sm:block">
            Use arrow keys to navigate
          </div>
        </footer>
      </div>
    </div>
  );
}
