import { FaFacebook, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhone, FaFax, FaEnvelope } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";

function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#294a70] text-white w-full relative overflow-hidden pt-0">
     
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-12">
      
        <div className="text-center mb-10 -mt-2">
          <div className="inline-block mb-4">
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">{t('footer.title')}</h2>
            </div>
          </div>
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto">
            {t('footer.university')}
          </p>
          <div className="mt-3 h-1 w-24 mx-auto bg-[#ffab1f]"></div>
        </div>

      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          
          <div className="space-y-6">
            <div className="group">
              <div className="relative">
                <div className="relative bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2944.971565345187!2d19.267979976505572!3d42.42834013078447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x134deb6802d0cc3b%3A0x6dc41d7a0bc12a45!2sUniverzitet%20Mediteran%20Podgorica!5e0!3m2!1sen!2s!4v1761667141132!5m2!1sen!2s"
                    loading="lazy"
                    className="w-full h-[220px] opacity-90"
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="relative bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-[#ffab1f] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#ffab1f] rounded-lg">
                    <FaMapMarkerAlt className="text-xl text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold mb-2 text-white">{t('footer.ourAddress')}</h3>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Josipa Broza bb<br />
                      Podgorica, Crna Gora
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#ffab1f] rounded-full"></span>
              {t('footer.contactUs')}
            </h3>

            <div className="space-y-3">
              {[
                { icon: FaPhone, labelKey: 'footer.phone' as const, value: '+382 20 409 204' },
                { icon: FaFax, labelKey: 'footer.fax' as const, value: '+382 20 409 232' },
                { icon: FaEnvelope, labelKey: 'footer.email' as const, value: 'fit.alumni.club@gmail.com' }
              ].map((item, index) => (
                <div key={index} className="group relative">
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/20 hover:border-[#ffab1f] transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#ffab1f] rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                        <item.icon className="text-lg text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-white/60 mb-1 uppercase tracking-wider">{t(item.labelKey)}</div>
                        <div className="text-base font-semibold text-white">{item.value}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="text-xs font-semibold text-white/80 mb-4 uppercase tracking-wider">{t('footer.socialNetworks')}</div>
              <div className="flex gap-3">
                {[
                  { icon: FaFacebook, color: '#1877f2', url: 'https://www.facebook.com/UniverzitetMediteranPodgorica/' },
                  { icon: FaInstagram, color: '#e4405f', url: 'https://www.instagram.com/usfitum/' },
                  { icon: FaYoutube, color: '#ff0000', url: '#' }
                ].map((social, index) => (
                  <a key={index} href={social.url} target="_blank" rel="noopener noreferrer" className="group relative">
                    <div 
                      className="relative w-12 h-12 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 shadow-lg"
                      style={{ backgroundColor: social.color }}
                    >
                      <social.icon className="text-lg text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-200">
          <div className="flex justify-center items-center">
            <div className="text-sm text-white">
              {t('footer.copyright')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;