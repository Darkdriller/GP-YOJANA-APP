// src/utils/i18n.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // General
      'app.title': 'Panchayat Yojana Dashboard',
      'header.logout': 'Logout',
      'header.language': 'Language',
      
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.datacollection': 'Data Collection',
      'nav.reports': 'Reports',
      'nav.guide': 'User Guide',

      // User Info
      'user.welcome': 'Welcome',
      'user.role': 'Role',
      'user.gp': 'Gram Panchayat',

      // Dashboard Page
      'dashboard.welcome': 'Welcome to Panchayat Yojana Platform',
      'dashboard.profile': {
        'edit': 'Edit Profile',
        'email': 'Email',
        'phone': 'Phone',
        'gender': 'Gender',
        'age': 'Age',
        'role': 'Role',
        'gpRole': 'GP Role',
        'district': 'District',
        'block': 'Block',
        'gramPanchayat': 'Gram Panchayat',
        'villages': 'Villages in',
      },
      'dashboard.functionalities': {
        'dataCollection': 'Collect and Update Data For Your GP',
        'gpSnapshot': "View Your GP's snapshot in Dashboard",
        'userGuide': 'How to use this Platform, complete Guide',
        'reports': 'View Reports and Past data collection details'
      },
      'dashboard.admin': {
        'title': 'Administrator Dashboard'
      },
      'dashboard.editProfile': {
        'title': 'Edit Profile',
        'firstName': 'First Name',
        'lastName': 'Last Name',
        'phoneNumber': 'Phone Number',
        'gender': 'Gender',
        'age': 'Age',
        'saveChanges': 'Save Changes'
      },
      'common.gender': {
        'male': 'Male',
        'female': 'Female',
        'other': 'Other'
      }
    }
  },
  or: {
    translation: {
      // General
      'app.title': 'ପଞ୍ଚାୟତ ଯୋଜନା ଡ୍ୟାସବୋର୍ଡ',
      'header.logout': 'ଲଗଆଉଟ୍',
      'header.language': 'ଭାଷା',
      
      // Navigation
      'nav.dashboard': 'ଡ୍ୟାସବୋର୍ଡ',
      'nav.datacollection': 'ତଥ୍ୟ ସଂଗ୍ରହ',
      'nav.reports': 'ରିପୋର୍ଟ',
      'nav.guide': 'ବ୍ୟବହାରକାରୀ ଗାଇଡ୍',

      // User Info
      'user.welcome': 'ସ୍ୱାଗତ',
      'user.role': 'ଭୂମିକା',
      'user.gp': 'ଗ୍ରାମ ପଞ୍ଚାୟତ',

      // Dashboard Page
      'dashboard.welcome': 'ପଞ୍ଚାୟତ ଯୋଜନା ପ୍ଲାଟଫର୍ମକୁ ସ୍ୱାଗତ',
      'dashboard.profile': {
        'edit': 'ପ୍ରୋଫାଇଲ୍ ସମ୍ପାଦନା',
        'email': 'ଇମେଲ୍',
        'phone': 'ଫୋନ୍',
        'gender': 'ଲିଙ୍ଗ',
        'age': 'ବୟସ',
        'role': 'ଭୂମିକା',
        'gpRole': 'ଜିପି ଭୂମିକା',
        'district': 'ଜିଲ୍ଲା',
        'block': 'ବ୍ଲକ',
        'gramPanchayat': 'ଗ୍ରାମ ପଞ୍ଚାୟତ',
        'villages': 'ଗ୍ରାମଗୁଡିକ',
      },
      'dashboard.functionalities': {
        'dataCollection': 'ଆପଣଙ୍କ ଜିପି ପାଇଁ ତଥ୍ୟ ସଂଗ୍ରହ ଏବଂ ଅପଡେଟ୍ କରନ୍ତୁ',
        'gpSnapshot': 'ଡ୍ୟାସବୋର୍ଡରେ ଆପଣଙ୍କ ଜିପିର ସ୍ନାପସଟ୍ ଦେଖନ୍ତୁ',
        'userGuide': 'ଏହି ପ୍ଲାଟଫର୍ମ କିପରି ବ୍ୟବହାର କରିବେ, ସମ୍ପୂର୍ଣ୍ଣ ଗାଇଡ୍',
        'reports': 'ରିପୋର୍ଟ ଏବଂ ପୂର୍ବ ତଥ୍ୟ ସଂଗ୍ରହ ବିବରଣୀ ଦେଖନ୍ତୁ'
      },
      'dashboard.admin': {
        'title': 'ପ୍ରଶାସକ ଡ୍ୟାସବୋର୍ଡ'
      },
      'dashboard.editProfile': {
        'title': 'ପ୍ରୋଫାଇଲ୍ ସମ୍ପାଦନା',
        'firstName': 'ପ୍ରଥମ ନାମ',
        'lastName': 'ଶେଷ ନାମ',
        'phoneNumber': 'ଫୋନ୍ ନମ୍ବର',
        'gender': 'ଲିଙ୍ଗ',
        'age': 'ବୟସ',
        'saveChanges': 'ପରିବର୍ତ୍ତନଗୁଡ଼ିକ ସଞ୍ଚୟ କରନ୍ତୁ'
      },
      'common.gender': {
        'male': 'ପୁରୁଷ',
        'female': 'ମହିଳା',
        'other': 'ଅନ୍ୟ'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;