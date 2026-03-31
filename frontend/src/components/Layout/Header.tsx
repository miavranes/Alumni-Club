import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import akfitLogo from "../../assets/akfit.png";


function Header() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
    setOpen(false);
  }

  const isAdmin = user?.role === "admin";
  const isRegularUser = user?.role === "user";

  const navLink =
    "relative text-[#294a70] transition-all duration-300 hover:text-[#1d3652] hover:-translate-y-[2px] " +
    "after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#294a70] " +
    "after:transition-all after:duration-300 hover:after:w-full";

  const buttonStyle =
    "px-3 py-1.5 border-2 border-[#294a70] rounded-full text-[#294a70] hover:bg-[#eef2ff] text-sm transition-colors whitespace-nowrap";

  const authButton =
    "px-4 py-2 rounded-full bg-[#1f3854] text-white font-medium hover:bg-[#152b3f] transition text-sm";

  return (
    <header className="bg-white shadow-lg border-b-[3px] border-[#ffab1f] fixed top-0 w-full z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">

          {/* LOGO */}
          <div className="flex-shrink-0">
            <Link to="/Home">
              <img
                src={akfitLogo}
                alt="Logo"
                className="h-12 sm:h-14 lg:h-16 w-auto"
              />
            </Link>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex gap-6 xl:gap-8 font-medium">
            <Link className={navLink} to="/AboutUs">{t('header.about')}</Link>
            <Link className={navLink} to="/AlumniDirectory">{t('header.alumni')}</Link>
            <Link className={navLink} to="/Blog">{t('header.blog')}</Link>
            <Link className={navLink} to="/Contact">{t('header.contact')}</Link>
            <Link className={navLink} to="/Theses">{t('header.theses')}</Link>
          </nav>

          {/* DESKTOP USER / GUEST */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 ml-auto mr-4 text-[#294a70]">
            {user ? (
              <div className="flex items-center gap-2 xl:gap-3">
                <span className="text-sm xl:text-base font-semibold whitespace-nowrap">
                  {t('header.welcome')}, <span className="font-bold">{user.username}</span>!
                </span>

                <Link to="/messages" className={buttonStyle}>{t('header.inbox')}</Link>

                {isRegularUser && (
                  <>
                    <Link to="/MyProfile" className={buttonStyle}>{t('header.profile')}</Link>
                    <Link to="/events" className={buttonStyle}>{t('header.events')}</Link>
                  </>
                )}

                {isAdmin && (
                  <Link to="/Dashboard" className={buttonStyle}>{t('header.dashboard')}</Link>
                )}

                <span
                  onClick={handleLogout}
                  className={authButton + " cursor-pointer"}
                >
                  {t('header.logout')}
                </span>

                {/* Language Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                    className="px-2 py-1.5 rounded-lg bg-gray-100 text-[#294a70] hover:bg-gray-200 transition-colors text-xs font-medium flex items-center gap-1"
                  >
                    <Globe size={14} />
                    <span className="uppercase">{language}</span>
                    <ChevronDown size={12} className="transition-transform duration-200" style={{
                      transform: languageDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }} />
                  </button>

                  {languageDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-50">
                      <button
                        onClick={() => {
                          setLanguage('me');
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                          language === 'me' ? 'bg-[#eef2ff] text-[#294a70] font-medium' : 'text-gray-700'
                        }`}
                      >
                        🇲🇪 Crnogorski
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('en');
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                          language === 'en' ? 'bg-[#eef2ff] text-[#294a70] font-medium' : 'text-gray-700'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link to="/events" className={buttonStyle}>
                  {t('header.events')}
                </Link>
                <Link to="/login" className={authButton}>
                  {t('header.login')}
                </Link>

                {/* Language Dropdown Menu for guests */}
                <div className="relative">
                  <button
                    onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                    className="px-2 py-1.5 rounded-lg bg-gray-100 text-[#294a70] hover:bg-gray-200 transition-colors text-xs font-medium flex items-center gap-1"
                  >
                    <Globe size={14} />
                    <span className="uppercase">{language}</span>
                    <ChevronDown size={12} className="transition-transform duration-200" style={{
                      transform: languageDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }} />
                  </button>

                  {languageDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-50">
                      <button
                        onClick={() => {
                          setLanguage('me');
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                          language === 'me' ? 'bg-[#eef2ff] text-[#294a70] font-medium' : 'text-gray-700'
                        }`}
                      >
                        🇲🇪 Crnogorski
                      </button>
                      <button
                        onClick={() => {
                          setLanguage('en');
                          setLanguageDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                          language === 'en' ? 'bg-[#eef2ff] text-[#294a70] font-medium' : 'text-gray-700'
                        }`}
                      >
                        🇬🇧 English
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden text-[#294a70] ml-auto p-1.5 hover:bg-gray-100 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="lg:hidden bg-white shadow-xl border-t border-gray-200 animate-slideDown">
          <nav className="flex flex-col p-4 gap-2 text-[#294a70] font-medium">

            <Link onClick={() => setOpen(false)} to="/Blog" className="py-3 px-2 hover:bg-gray-50 rounded-lg">{t('header.blog')}</Link>
            <Link onClick={() => setOpen(false)} to="/AlumniDirectory" className="py-3 px-2 hover:bg-gray-50 rounded-lg">{t('header.alumni')}</Link>
            <Link onClick={() => setOpen(false)} to="/AboutUs" className="py-3 px-2 hover:bg-gray-50 rounded-lg">{t('header.about')}</Link>
            <Link onClick={() => setOpen(false)} to="/Contact" className="py-3 px-2 hover:bg-gray-50 rounded-lg">{t('header.contact')}</Link>
            <Link onClick={() => setOpen(false)} to="/Theses" className="py-3 px-2 hover:bg-gray-50 rounded-lg">{t('header.theses')}</Link>

            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="px-2 py-2 bg-gray-50 rounded-lg font-semibold">
                    {user.username}
                  </div>

                  <Link onClick={() => setOpen(false)} to="/messages" className={buttonStyle}>{t('header.inbox')}</Link>

                  {isRegularUser && (
                    <>
                      <Link onClick={() => setOpen(false)} to="/MyProfile" className={buttonStyle}>{t('header.myProfile')}</Link>
                      <Link onClick={() => setOpen(false)} to="/events" className={buttonStyle}>{t('header.events')}</Link>
                    </>
                  )}

                  {isAdmin && (
                    <Link onClick={() => setOpen(false)} to="/Dashboard" className={buttonStyle}>{t('header.dashboard')}</Link>
                  )}

                  <button onClick={handleLogout} className={authButton}>
                    {t('header.logout')}
                  </button>

                  {/* Mobile Language Buttons */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setLanguage('me')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        language === 'me' 
                          ? 'bg-[#294a70] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🇲🇪 Crnogorski
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        language === 'en' 
                          ? 'bg-[#294a70] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🇬🇧 English
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    onClick={() => setOpen(false)}
                    to="/events"
                    className="w-full text-center py-2.5 px-4 border-2 border-[#294a70] rounded-full hover:bg-[#eef2ff] transition"
                  >
                    {t('header.events')}
                  </Link>

                  <Link
                    onClick={() => setOpen(false)}
                    to="/login"
                    className={authButton + " w-full text-center"}
                  >
                    {t('header.login')}
                  </Link>

                  {/* Mobile Language Buttons for guests */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setLanguage('me')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        language === 'me' 
                          ? 'bg-[#294a70] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🇲🇪 Crnogorski
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        language === 'en' 
                          ? 'bg-[#294a70] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🇬🇧 English
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
