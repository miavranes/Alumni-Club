import React, { useState, useEffect } from 'react';
import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';
import img3 from '../assets/img3.jpg';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Countdown do Dana alumnista (15. maj 2025)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Kreiraj datum eksplicitno: godina, mjesec (0-11), dan
      const targetDate = new Date(2026, 4, 15, 0, 0, 0);

      console.log('Trenutno vrijeme:', now);
      console.log('Ciljni datum:', targetDate);

      const timeDifference = targetDate.getTime() - now.getTime();

      console.log('Razlika u milisekundama:', timeDifference);

      if (timeDifference > 0) {
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        console.log('Preostalo:', { days, hours, minutes, seconds });
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const sections = [
    {
      image: {
        src: img1,
        alt: "Networking image",
      },
      heading: t('home.section1.heading'),
      description: t('home.section1.description'),
    },
    {
      image: {
        src: img2,
        alt: "Mentorship image",
      },
      heading: t('home.section2.heading'),
      description: t('home.section2.description'),
    },
    {
      image: {
        src: img3,
        alt: "Career development image",
      },
      heading: t('home.section3.heading'),
      description: t('home.section3.description'),
    },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes textShimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .text-shimmer {
          background: linear-gradient(90deg, #ffffff 25%, #f0f0f0 50%, #ffffff 75%);
          background-size: 200% 100%;
          animation: textShimmer 3s ease-in-out infinite;
          -webkit-background-clip: text;
          background-clip: text;
        }

        .countdown-number {
          transition: all 0.3s ease;
        }

        /* Glass morphism effect */
        .glass-effect {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>

      <div className="overflow-x-hidden max-w-full">
        <section className="px-[5%] py-16 md:py-24 lg:py-28">
          <div className="container">
            <div className="flex flex-col items-center">
              {/* Header with fade-in animation */}
              <div className="mb-12 text-center md:mb-18 lg:mb-20 animate-fade-in opacity-0" style={{ animationDelay: '200ms' }}>
                <div className="w-full max-w-4xl">
                  {/* Gradient background for title */}
                  <div className="relative mb-8">
                    <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl 
                                   bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent
                                   drop-shadow-2xl relative z-10">
                      {t('home.heading')}
                    </h2>
                  </div>
                  
                  {/* Enhanced description with better typography */}
                  <div className="relative">
                    <p className="text-lg md:text-xl lg:text-2xl text-gray-200 leading-relaxed font-light
                                  max-w-3xl mx-auto">
                      {t('home.description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sections with staggered animations */}
              <div className="grid grid-cols-1 items-start justify-center gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12 max-[950px]:flex-col max-[950px]:items-center max-[950px]:w-[98vw] max-[950px]:gap-6">
                {sections?.map((section, index) => (
                  <div
                    key={index}
                    className="flex w-full flex-col items-center text-center animate-slide-up opacity-0"
                    style={{
                      animationDelay: `${600 + index * 200}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    <div className="mb-6 md:mb-8">
                      <img
                        src={section.image.src}
                        alt={section.image.alt}
                        className="max-[950px]:w-[88vw] max-[950px]:min-w-[120px] max-[950px]:max-w-[250px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="mb-5 text-2xl font-bold md:mb-6 md:text-3xl md:leading-[1.3] lg:text-4xl 
                                   bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent
                                   drop-shadow-2xl">
                      {section.heading}
                    </h3>
                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light">{section.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Orange Button with White Text - animated */}
        <div className="flex justify-center items-center mt-16 animate-fade-in opacity-0" style={{ animationDelay: '1400ms', animationFillMode: 'forwards' }}>
          <button
            onClick={() => navigate('/AboutUs')}
            className="py-3 px-8 rounded-lg text-white font-semibold text-lg
                       bg-[#ffab1f] border-2 border-[#ffab1f]
                       hover:bg-[#ff9500] hover:border-[#ff9500]
                       transform transition-all duration-300 ease-in-out hover:-translate-y-1
                       shadow-md hover:shadow-xl hover:shadow-[#ffab1f]/30
                       min-w-[200px]"
          >
            {t('home.readMore')}
          </button>
        </div>

        {/* Alumni Day Countdown Section */}
        <section className="mt-20 px-[5%] py-16 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#ffab1f] to-[#ff9500] rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#294a70] mb-4">
                {t('home.alumniDay.title')}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                {t('home.alumniDay.description')}
              </p>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#294a70] to-[#324D6B] text-white rounded-full text-base font-semibold shadow-lg">
                {t('home.alumniDay.date')}
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {[
                  { value: timeLeft.days, label: t('home.alumniDay.days') },
                  { value: timeLeft.hours, label: t('home.alumniDay.hours') },
                  { value: timeLeft.minutes, label: t('home.alumniDay.minutes') },
                  { value: timeLeft.seconds, label: t('home.alumniDay.seconds') }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-6 md:p-8 shadow-lg">
                      <div className="text-3xl md:text-5xl font-bold text-gray-700 mb-2 font-mono countdown-number">
                        {String(item.value).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="text-lg md:text-xl font-semibold text-gray-700 mt-4">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Event Details */}
              <div className="mt-12 grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#294a70] to-[#324D6B] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#294a70] mb-2">{t('home.alumniDay.location')}</h3>
                  <p className="text-gray-600">{t('home.alumniDay.locationDesc').split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}</p>
                </div>

                <div className="text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#294a70] to-[#324D6B] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#294a70] mb-2">{t('home.alumniDay.networking')}</h3>
                  <p className="text-gray-600">{t('home.alumniDay.networkingDesc').split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}</p>
                </div>

                <div className="text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#294a70] to-[#324D6B] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#294a70] mb-2">{t('home.alumniDay.workshops')}</h3>
                  <p className="text-gray-600">{t('home.alumniDay.workshopsDesc').split('\n').map((line, i) => (
                    <span key={i}>{line}{i === 0 && <br />}</span>
                  ))}</p>
                </div>
              </div>

              {/* Welcome Message */}
              <div className="text-center mt-12">
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#294a70] mb-4">
                    {t('home.alumniDay.welcomeTitle')}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {t('home.alumniDay.welcomeText')}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {t('home.alumniDay.students')}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {t('home.alumniDay.graduates')}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      {t('home.alumniDay.professors')}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      {t('home.alumniDay.guests')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-6 italic">
                    {t('home.alumniDay.quote')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;