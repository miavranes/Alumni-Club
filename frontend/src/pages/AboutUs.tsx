import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';
import img3 from '../assets/img3.jpg';
import konsultacija from '../assets/konsultacija.png';
import projekat from '../assets/projekat.png';
import event from '../assets/event.png';

function AboutUs() {
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef(null);
  const { t } = useLanguage();

  const targetNumbers = [500, 50, 20, 15];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          // Animate each counter
          targetNumbers.forEach((target, index) => {
            let current = 0;
            const increment = target / 60; // 60 frames for smooth animation
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              setCounters(prev => {
                const newCounters = [...prev];
                newCounters[index] = Math.floor(current);
                return newCounters;
              });
            }, 30); // Update every 30ms
          });
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div className="w-full min-h-screen bg-white relative overflow-hidden">
      {/* Background Design Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(rgba(41, 74, 112, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(41, 74, 112, 0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Diagonal lines */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diagonalLines" patternUnits="userSpaceOnUse" width="100" height="100">
                <path d="M0,100 L100,0" stroke="#294a70" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonalLines)" />
          </svg>
        </div>
      </div>

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#294a70] to-[#324D6B] text-white py-12 md:py-16 px-4 text-center relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4
                       bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent
                       drop-shadow-2xl">
          {t('aboutus.title')}
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed font-light max-w-xl mx-auto">
          {t('aboutus.subtitle')}
        </p>
      </div>

      {/* WRAPPER */}
      <div className="max-w-7xl mx-auto py-12 md:py-20 px-4 relative z-10">

        {/* SECTION 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20 items-center mb-16 md:mb-24">
          <div className="space-y-5 text-justify">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#294a70]">
              {t('aboutus.howItStarted')}
            </h2>
            <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
              {t('aboutus.howItStartedText1')}
            </p>
            <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
              {t('aboutus.howItStartedText2')}
            </p>
          </div>
          
          {/* Projekat image */}
          <div>
            <img 
              src={projekat} 
              alt="Alumni FIT projekat" 
              className="rounded-lg shadow-lg w-full h-64 object-cover hover:shadow-xl transition-shadow duration-300"
              loading="lazy"
            />
          </div>
        </div>

        {/* SECTION 2 (REVERSED) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20 items-center mb-16 md:mb-24 lg:[direction:rtl]">
          {/* Image section */}
          <div className="lg:[direction:ltr]">
            <img 
              src={konsultacija} 
              alt="Konsultacije i mentorstvo" 
              className="rounded-lg shadow-lg w-full h-64 object-cover hover:shadow-xl transition-shadow duration-300"
              loading="lazy"
            />
          </div>
          
          <div className="space-y-5 lg:[direction:ltr] text-justify">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#294a70]">
              {t('aboutus.ourMission')}
            </h2>

            <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
              {t('aboutus.ourMissionText1')}
            </p>

            <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
              {t('aboutus.ourMissionText2')}
            </p>
          </div>
        </div>

        {/* SECTION 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20 items-center mb-16 md:mb-24">
          <div className="space-y-5 text-justify">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#294a70]">
              {t('aboutus.whatWeOffer')}
            </h2>

            <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
              {t('aboutus.whatWeOfferText')}
            </p>
            
            {/* Feature list */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="w-2 h-2 bg-[#ffab1f] rounded-full"></div>
                <span className="text-gray-700">{t('aboutus.feature1')}</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="w-2 h-2 bg-[#ffab1f] rounded-full"></div>
                <span className="text-gray-700">{t('aboutus.feature2')}</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="w-2 h-2 bg-[#ffab1f] rounded-full"></div>
                <span className="text-gray-700">{t('aboutus.feature3')}</span>
              </div>
            </div>
          </div>
          
          {/* Event photo */}
          <div>
            <img 
              src={event} 
              alt="Alumni eventi i aktivnosti" 
              className="rounded-lg shadow-lg w-full h-64 object-cover hover:shadow-xl transition-shadow duration-300"
              loading="lazy"
            />
          </div>
        </div>

        {/* STATS */}
        <div className="my-20" ref={statsRef}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#294a70] text-center mb-4">
            {t('aboutus.ourNumbers')}
          </h2>
          <p className="text-center text-gray-600 mb-12">{t('aboutus.ourNumbersSubtitle')}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {targetNumbers.map((target, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-[#294a70] to-[#324D6B] text-white p-8 md:p-10 rounded-lg text-center shadow-md hover:shadow-lg hover:shadow-[#294a70]/30 hover:-translate-y-1 transition-all duration-300 group"
              >
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#ffab1f] mb-2 group-hover:drop-shadow-[0_0_8px_rgba(255,171,31,0.6)] transition-all duration-300">
                  {counters[i]}{i === 3 ? '+' : '+'}
                </h3>
                <p className="text-sm sm:text-base opacity-90 font-medium">
                  {i === 0 && t('aboutus.label1')}
                  {i === 1 && t('aboutus.label2')}
                  {i === 2 && t('aboutus.label3')}
                  {i === 3 && t('aboutus.label4')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* VALUES */}
        <div className="mt-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#294a70] text-center mb-4">
            {t('aboutus.ourValues')}
          </h2>
          <p className="text-center text-gray-600 mb-14">{t('aboutus.ourValuesSubtitle')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {[
              { titleKey: 'aboutus.value1.title' as const, textKey: 'aboutus.value1.text' as const },
              { titleKey: 'aboutus.value2.title' as const, textKey: 'aboutus.value2.text' as const },
              { titleKey: 'aboutus.value3.title' as const, textKey: 'aboutus.value3.text' as const },
              { titleKey: 'aboutus.value4.title' as const, textKey: 'aboutus.value4.text' as const }
            ].map((value, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-[#294a70] to-[#324D6B] text-white p-8 md:p-10 rounded-lg text-center shadow-md hover:shadow-lg hover:shadow-[#294a70]/30 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="text-4xl mb-4 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-300">
                  {['🤝', '💡', '🎓', '🌟'][i]}
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-[#ffab1f] mb-3 group-hover:drop-shadow-[0_0_8px_rgba(255,171,31,0.6)] transition-all duration-300">
                  {t(value.titleKey)}
                </h3>
                <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                  {t(value.textKey)}
                </p>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}

export default AboutUs;
