import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'me' | 'en';

type TranslationKeys = {
  // Header translations
  'header.about': string;
  'header.alumni': string;
  'header.blog': string;
  'header.contact': string;
  'header.theses': string;
  'header.events': string;
  'header.welcome': string;
  'header.inbox': string;
  'header.profile': string;
  'header.dashboard': string;
  'header.logout': string;
  'header.login': string;
  'header.myProfile': string;
  
  // AboutUs translations
  'aboutus.title': string;
  'aboutus.subtitle': string;
  'aboutus.howItStarted': string;
  'aboutus.howItStartedText1': string;
  'aboutus.howItStartedText2': string;
  'aboutus.ourMission': string;
  'aboutus.ourMissionText1': string;
  'aboutus.ourMissionText2': string;
  'aboutus.whatWeOffer': string;
  'aboutus.whatWeOfferText': string;
  'aboutus.feature1': string;
  'aboutus.feature2': string;
  'aboutus.feature3': string;
  'aboutus.ourNumbers': string;
  'aboutus.ourNumbersSubtitle': string;
  'aboutus.label1': string;
  'aboutus.label2': string;
  'aboutus.label3': string;
  'aboutus.label4': string;
  'aboutus.ourValues': string;
  'aboutus.ourValuesSubtitle': string;
  'aboutus.value1.title': string;
  'aboutus.value1.text': string;
  'aboutus.value2.title': string;
  'aboutus.value2.text': string;
  'aboutus.value3.title': string;
  'aboutus.value3.text': string;
  'aboutus.value4.title': string;
  'aboutus.value4.text': string;
  
  // Footer translations
  'footer.title': string;
  'footer.university': string;
  'footer.ourAddress': string;
  'footer.contactUs': string;
  'footer.phone': string;
  'footer.fax': string;
  'footer.email': string;
  'footer.socialNetworks': string;
  'footer.copyright': string;
  
  // Home page translations
  'home.tagline': string;
  'home.heading': string;
  'home.description': string;
  'home.section1.heading': string;
  'home.section1.description': string;
  'home.section2.heading': string;
  'home.section2.description': string;
  'home.section3.heading': string;
  'home.section3.description': string;
  'home.readMore': string;
  'home.alumniDay.title': string;
  'home.alumniDay.description': string;
  'home.alumniDay.date': string;
  'home.alumniDay.location': string;
  'home.alumniDay.locationDesc': string;
  'home.alumniDay.networking': string;
  'home.alumniDay.networkingDesc': string;
  'home.alumniDay.workshops': string;
  'home.alumniDay.workshopsDesc': string;
  'home.alumniDay.welcomeTitle': string;
  'home.alumniDay.welcomeText': string;
  'home.alumniDay.quote': string;
  'home.alumniDay.students': string;
  'home.alumniDay.graduates': string;
  'home.alumniDay.professors': string;
  'home.alumniDay.guests': string;
  'home.alumniDay.days': string;
  'home.alumniDay.hours': string;
  'home.alumniDay.minutes': string;
  'home.alumniDay.seconds': string;
  
  // Blog page translations
  'blog.tagline': string;
  'blog.heading': string;
  'blog.description': string;
  'blog.addBlog': string;
  'blog.viewAll': string;
  'blog.showLess': string;
  'blog.loading': string;
  'blog.noPosts': string;
  'blog.modal.title': string;
  'blog.modal.close': string;
  'blog.modal.preview': string;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation objects
const translations: Record<Language, TranslationKeys> = {
  me: {
    // Header translations
    'header.about': 'O nama',
    'header.alumni': 'Alumnisti',
    'header.blog': 'Blog',
    'header.contact': 'Kontakt',
    'header.theses': 'Diplomski radovi',
    'header.events': 'Događaji',
    'header.welcome': 'Dobrodošao/la',
    'header.inbox': 'Inbox',
    'header.profile': 'Profil',
    'header.dashboard': 'Dashboard',
    'header.logout': 'Odjavi se',
    'header.login': 'Prijavi se',
    'header.myProfile': 'Moj profil',
    
    // AboutUs translations
    'aboutus.title': 'O nama',
    'aboutus.subtitle': 'Alumni zajednica Fakulteta za informacione tehnologije',
    'aboutus.howItStarted': 'Kako je nastala Alumni klub platforma',
    'aboutus.howItStartedText1': 'Alumni FIT platforma je nastala kao projekat koji su realizovali studenti treće godine Fakulteta za informacione tehnologije u akademskoj 2025/2026. godini, u okviru predmeta Distribuirani razvoj softvera.',
    'aboutus.howItStartedText2': 'Ono što je počelo kao studentski projekat, preraslo je u vitalni alat za umrežavanje koji povezuje generacije studenata i profesionalaca širom svijeta. Danas smo ponosni na našu zajednicu koja raste svakim danom.',
    'aboutus.ourMission': 'Naša misija',
    'aboutus.ourMissionText1': 'Alumni FIT je platforma koja povezuje bivše studente i stvara mostove između akademskog svijeta i industrije. Mi vjerujemo da svaki student zaslužuje podršku i priliku da ostvari svoje snove.',
    'aboutus.ourMissionText2': 'Vjerujemo u snagu zajednice i želimo da svaki alumni član ima pristup resursima, mentorstvu i mogućnostima koje će im pomoći da napreduju u karijeri. Zajedno smo jači.',
    'aboutus.whatWeOffer': 'Šta nudimo',
    'aboutus.whatWeOfferText': 'Kroz našu platformu možete pronaći bivše kolege, pratiti njihovu karijeru, dijeliti iskustva i učiti jedni od drugih. Od događaja za umrežavanje do mentorskih programa - imamo sve što vam treba.',
    'aboutus.feature1': 'Moderna platforma za povezivanje',
    'aboutus.feature2': 'Ekskluzivni događaji i okupljanja',
    'aboutus.feature3': 'Karijerni savjeti i oglasi za zapošljavanje',
    'aboutus.ourNumbers': 'Naši brojevi',
    'aboutus.ourNumbersSubtitle': 'Statistike koje govore o našem uspjehu',
    'aboutus.label1': 'Alumni članova',
    'aboutus.label2': 'Kompanija',
    'aboutus.label3': 'Država',
    'aboutus.label4': 'Godina tradicije',
    'aboutus.ourValues': 'Naše vrijednosti',
    'aboutus.ourValuesSubtitle': 'Principi koji nas vode u svemu što radimo',
    'aboutus.value1.title': 'Povezanost',
    'aboutus.value1.text': 'Gradimo mostove između generacija i profesionalaca',
    'aboutus.value2.title': 'Inovacija',
    'aboutus.value2.text': 'Podsticanje kreativnosti i novih ideja',
    'aboutus.value3.title': 'Obrazovanje',
    'aboutus.value3.text': 'Kontinuirano učenje i razvoj',
    'aboutus.value4.title': 'Izvrsnost',
    'aboutus.value4.text': 'Težnja ka vrhunskim rezultatima',
    
    // Footer translations
    'footer.title': 'Alumni Klub FIT',
    'footer.university': 'Univerzitet Mediteran - Fakultet za informacione tehnologije',
    'footer.ourAddress': 'Naša Adresa',
    'footer.contactUs': 'Kontaktirajte nas',
    'footer.phone': 'Telefon',
    'footer.fax': 'Fax',
    'footer.email': 'E-mail',
    'footer.socialNetworks': 'Društvene mreže',
    'footer.copyright': '© 2025 Alumni FIT. Zajedno gradimo budućnost.',
    
    // Home page translations
    'home.tagline': 'Dobrodošli',
    'home.heading': 'Alumni klub FIT',
    'home.description': 'Povezujemo generacije studenata i profesionalaca kroz inovativnu platformu koja omogućava umrežavanje, mentorstvo i razmjenu iskustava. Pridružite se našoj zajednici i gradite svoju budućnost zajedno sa nama.',
    'home.section1.heading': 'Umrežavanje i povezivanje',
    'home.section1.description': 'Pronađite bivše kolege, upoznajte nove ljude iz industrije i proširite svoju profesionalnu mrežu kroz našu platformu.',
    'home.section2.heading': 'Mentorstvo i savjeti',
    'home.section2.description': 'Dobijte vrijedne savjete od iskusnih profesionalaca i podijelite svoje znanje sa mladim kolegama.',
    'home.section3.heading': 'Karijerni razvoj',
    'home.section3.description': 'Pristupite ekskluzivnim oglasima za posao, radionicama i događajima koji će vam pomoći u napredovanju karijere.',
    'home.readMore': 'Pročitaj više...',
    'home.alumniDay.title': 'Dan Alumnista 2026',
    'home.alumniDay.description': 'Pridružite se najvećem okupljanju naših alumnista! Zajedno slavimo uspjehe, dijelimo iskustva i oblikujemo budućnost.',
    'home.alumniDay.date': '15. Maj 2026',
    'home.alumniDay.location': 'Lokacija',
    'home.alumniDay.locationDesc': 'Univerzitet Mediteran\nPodgorica',
    'home.alumniDay.networking': 'Umrežavanje',
    'home.alumniDay.networkingDesc': 'Povezivanje sa\nkolegama i mentorima',
    'home.alumniDay.workshops': 'Radionice',
    'home.alumniDay.workshopsDesc': 'Edukativni sadržaji\ni stručno usavršavanje',
    'home.alumniDay.welcomeTitle': 'Svi su Dobrodošli!',
    'home.alumniDay.welcomeText': 'Dan alumnista je prilika za sve nas da se okupimo, podijelimo uspjehe i iskustva, te gradimo još jače veze u našoj zajednici. Bez obzira na godinu diplomiranja ili trenutnu poziciju - svaki alumni je dragocjen dio naše velike porodice.',
    'home.alumniDay.quote': '"Zajedno smo jači - svaki glas, svako iskustvo, svaki uspjeh čini našu zajednicu bogatijom."',
    'home.alumniDay.students': 'Studenti',
    'home.alumniDay.graduates': 'Diplomci',
    'home.alumniDay.professors': 'Profesori',
    'home.alumniDay.guests': 'Gosti',
    'home.alumniDay.days': 'Dana',
    'home.alumniDay.hours': 'Sati',
    'home.alumniDay.minutes': 'Minuta',
    'home.alumniDay.seconds': 'Sekundi',
    
    // Blog page translations
    'blog.tagline': 'Blog',
    'blog.heading': 'Najnovije vijesti i članci',
    'blog.description': 'Pratite najnovije trendove u tehnologiji, savjete za karijeru i priče naših alumni članova.',
    'blog.addBlog': 'Dodaj Blog',
    'blog.viewAll': 'Prikaži sve',
    'blog.showLess': 'Prikaži manje',
    'blog.loading': 'Učitavanje...',
    'blog.noPosts': 'Nema objavljenih članaka.',
    'blog.modal.title': 'Blog članak',
    'blog.modal.close': 'Zatvori',
    'blog.modal.preview': 'Ovo je pregled blog članka. Potpuni sadržaj bi bio učitan sa backenda.'
  },
  en: {
    // Header translations
    'header.about': 'About Us',
    'header.alumni': 'Alumni',
    'header.blog': 'Blog',
    'header.contact': 'Contact',
    'header.theses': 'Theses',
    'header.events': 'Events',
    'header.welcome': 'Welcome',
    'header.inbox': 'Inbox',
    'header.profile': 'Profile',
    'header.dashboard': 'Dashboard',
    'header.logout': 'Logout',
    'header.login': 'Login',
    'header.myProfile': 'My Profile',
    
    // AboutUs translations
    'aboutus.title': 'About Us',
    'aboutus.subtitle': 'Alumni community of the Faculty of Information Technology',
    'aboutus.howItStarted': 'How was the Alumni Club platform created',
    'aboutus.howItStartedText1': 'The Alumni FIT platform was created as a project developed by third-year students of the Faculty of Information Technologies during the 2025/2026 academic year, as part of the Distributed Software Development course.',
    'aboutus.howItStartedText2': 'What began as a student project has grown into a vital networking tool that connects generations of students and professionals around the world. Today we are proud of our community that grows every day.',
    'aboutus.ourMission': 'Our Mission',
    'aboutus.ourMissionText1': 'Alumni FIT is a platform that connects former students and creates bridges between the academic world and industry. We believe that every student deserves support and the opportunity to achieve their dreams.',
    'aboutus.ourMissionText2': 'We believe in the power of community and want every alumni member to have access to resources, mentorship and opportunities that will help them advance in their careers. Together we are stronger.',
    'aboutus.whatWeOffer': 'What We Offer',
    'aboutus.whatWeOfferText': 'Through our platform you can find old colleagues, follow their careers, share experiences and learn from each other. From networking events to mentorship programs - we have everything you need.',
    'aboutus.feature1': 'Modern platform for networking',
    'aboutus.feature2': 'Exclusive events and meetups',
    'aboutus.feature3': 'Career advice and job board',
    'aboutus.ourNumbers': 'Our Numbers',
    'aboutus.ourNumbersSubtitle': 'Statistics that speak about our success',
    'aboutus.label1': 'Alumni members',
    'aboutus.label2': 'Companies',
    'aboutus.label3': 'Countries',
    'aboutus.label4': 'Years of tradition',
    'aboutus.ourValues': 'Our Values',
    'aboutus.ourValuesSubtitle': 'Principles that guide us in everything we do',
    'aboutus.value1.title': 'Connection',
    'aboutus.value1.text': 'Building bridges between generations and professionals',
    'aboutus.value2.title': 'Innovation',
    'aboutus.value2.text': 'Encouraging creativity and new ideas',
    'aboutus.value3.title': 'Education',
    'aboutus.value3.text': 'Continuous learning and development',
    'aboutus.value4.title': 'Excellence',
    'aboutus.value4.text': 'Striving for outstanding results',
    
    // Footer translations
    'footer.title': 'Alumni Club FIT',
    'footer.university': 'University Mediteran - Faculty of Information Technology',
    'footer.ourAddress': 'Our Address',
    'footer.contactUs': 'Contact Us',
    'footer.phone': 'Phone',
    'footer.fax': 'Fax',
    'footer.email': 'E-mail',
    'footer.socialNetworks': 'Social Media',
    'footer.copyright': '© 2025 Alumni FIT. Building the future together.',
    
    // Home page translations
    'home.tagline': 'Welcome',
    'home.heading': 'Alumni Club FIT',
    'home.description': 'Connecting generations of students and professionals through an innovative platform that enables networking, mentorship and experience sharing. Join our community and build your future together with us.',
    'home.section1.heading': 'Networking and connections',
    'home.section1.description': 'Find old colleagues, meet new people from the industry and expand your professional network through our platform.',
    'home.section2.heading': 'Mentorship and advice',
    'home.section2.description': 'Get valuable advice from experienced professionals and share your knowledge with young colleagues.',
    'home.section3.heading': 'Career development',
    'home.section3.description': 'Access exclusive job postings, workshops and events that will help you advance your career.',
    'home.readMore': 'Read more...',
    'home.alumniDay.title': 'Alumni Day 2026',
    'home.alumniDay.description': 'Join the biggest gathering of our alumni! Together we celebrate successes, share experiences and shape the future.',
    'home.alumniDay.date': 'May 15, 2026',
    'home.alumniDay.location': 'Location',
    'home.alumniDay.locationDesc': 'University Mediteran\nPodgorica',
    'home.alumniDay.networking': 'Networking',
    'home.alumniDay.networkingDesc': 'Connecting with\ncolleagues and mentors',
    'home.alumniDay.workshops': 'Workshops',
    'home.alumniDay.workshopsDesc': 'Educational content\nand professional development',
    'home.alumniDay.welcomeTitle': 'Everyone is Welcome!',
    'home.alumniDay.welcomeText': 'Alumni Day is an opportunity for all of us to gather, share successes and experiences, and build even stronger bonds in our community. Regardless of graduation year or current position - every alumni is a precious part of our big family.',
    'home.alumniDay.quote': '"Together we are stronger - every voice, every experience, every success makes our community richer."',
    'home.alumniDay.students': 'Students',
    'home.alumniDay.graduates': 'Graduates',
    'home.alumniDay.professors': 'Professors',
    'home.alumniDay.guests': 'Guests',
    'home.alumniDay.days': 'Days',
    'home.alumniDay.hours': 'Hours',
    'home.alumniDay.minutes': 'Minutes',
    'home.alumniDay.seconds': 'Seconds',
    
    // Blog page translations
    'blog.tagline': 'Blog',
    'blog.heading': 'Latest news and articles',
    'blog.description': 'Follow the latest trends in technology, career advice and stories from our alumni members.',
    'blog.addBlog': 'Add Blog',
    'blog.viewAll': 'View all',
    'blog.showLess': 'Show less',
    'blog.loading': 'Loading...',
    'blog.noPosts': 'No blog posts yet.',
    'blog.modal.title': 'Blog Post',
    'blog.modal.close': 'Close',
    'blog.modal.preview': 'This is a preview of the blog post. The full content would be loaded from the backend.'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('me');

  const t = (key: keyof TranslationKeys): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}