// contexts/LanguageContext.tsx
import React, { createContext, useContext, useState } from 'react';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations object
const translations = {
  en: {
    "dept.name": "Panchayat Raj & Drinking Water Department",
    "dept.govt": "Government of Odisha",
    "nav.home": "Home",
    "nav.about": "About Us",
    "nav.programme": "Programme",
    "nav.projects": "Projects",
    "auth.signup": "Sign Up",
    "auth.login": "Log In",
    "about.title": "About Us",
    "about.p1": "Odisha Grama Panchayat Act was enacted in the year 1948. Subsequently in the year 1961, 3 tier system of Panchayat Raj Institutions was introduced in Odisha.",
    "about.p2": "Over the last 50 years Panchayati Raj Institutions have emerged as the powerful institutions in bringing about rapid and sustainable development and socio-economic transformation in rural Odisha.",
    "about.p3": "It has an integrated perspective towards improving the quality of lives of rural people and ensuring equity and effective peoples' participation. 73rd amendment of the Constitution has conferred constitutional status to Panchayati Raj Institutions.",
    "footer.address.line1": "Panchayat Raj and Drinking Water Department,",
    "footer.address.line2": "Odisha Govt. Secretariat Building,Bhubaneswar",
    "footer.address.line3": "Pin- 751001, Odisha, India",
    "footer.quicklinks": "QUICK LINKS",
    "footer.followus": "FOLLOW US ON"
  },
  od: {
    "dept.name": "ପଞ୍ଚାୟତରାଜ ଓ ପାନୀୟ ଜଳ ବିଭାଗ",
    "dept.govt": "ଓଡ଼ିଶା ସରକାର",
    "nav.home": "ମୁଖ୍ୟ ପୃଷ୍ଠା",
    "nav.about": "ଆମ ବିଷୟରେ",
    "nav.programme": "କାର୍ଯ୍ୟକ୍ରମ",
    "nav.projects": "ପ୍ରକଳ୍ପଗୁଡ଼ିକ",
    "auth.signup": "ପଞ୍ଜୀକରଣ",
    "auth.login": "ଲଗଇନ୍",
    "about.title": "ଆମ ବିଷୟରେ",
    "about.p1": "ଓଡ଼ିଶା ଗ୍ରାମ ପଞ୍ଚାୟତ ଆଇନ ୧୯୪୮ ମସିହାରେ ପ୍ରଣୟନ କରାଯାଇଥିଲା। ପରବର୍ତ୍ତୀ ସମୟରେ ୧୯୬୧ ମସିହାରେ ଓଡ଼ିଶାରେ ତ୍ରିସ୍ତରୀୟ ପଞ୍ଚାୟତିରାଜ ବ୍ୟବସ୍ଥା ପ୍ରଚଳନ କରାଗଲା।",
    "about.p2": "ବିଗତ ୫୦ ବର୍ଷ ମଧ୍ୟରେ ପଞ୍ଚାୟତିରାଜ ଅନୁଷ୍ଠାନଗୁଡ଼ିକ ଗ୍ରାମାଞ୍ଚଳର ଦ୍ରୁତ ଓ ଦୀର୍ଘସ୍ଥାୟୀ ବିକାଶ ଏବଂ ସାମାଜିକ-ଆର୍ଥିକ ରୂପାନ୍ତରଣ ଆଣିବାରେ ଶକ୍ତିଶାଳୀ ଅନୁଷ୍ଠାନ ଭାବରେ ଉଭା ହୋଇଛନ୍ତି।",
    "about.p3": "ଏହା ଗ୍ରାମାଞ୍ଚଳର ଲୋକମାନଙ୍କର ଜୀବନର ମାନ ଉନ୍ନତ କରିବା ଏବଂ ସମାନତା ଓ ଲୋକଙ୍କର କାର୍ଯ୍ୟକାରୀ ଅଂଶଗ୍ରହଣ ସୁନିଶ୍ଚିତ କରିବା ଦିଗରେ ଏକ ସମନ୍ୱିତ ଦୃଷ୍ଟିକୋଣ ରଖିଛି। ସମ୍ବିଧାନର ୭୩ତମ ସଂଶୋଧନ ପଞ୍ଚାୟତିରାଜ ଅନୁଷ୍ଠାନଗୁଡ଼ିକୁ ସାମ୍ବିଧାନିକ ମାନ୍ୟତା ପ୍ରଦାନ କରିଛି।",
    "footer.address.line1": "ପଞ୍ଚାୟତରାଜ ଓ ପାନୀୟ ଜଳ ବିଭାଗ,",
    "footer.address.line2": "ଓଡ଼ିଶା ସରକାରଙ୍କ ସଚିବାଳୟ ଭବନ, ଭୁବନେଶ୍ୱର",
    "footer.address.line3": "ପିନ୍- ୭୫୧୦୦୧, ଓଡ଼ିଶା, ଭାରତ",
    "footer.quicklinks": "ଦ୍ରୁତ ଲିଙ୍କ୍",
    "footer.followus": "ଆମକୁ ଅନୁସରଣ କରନ୍ତୁ"
  }
};

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};