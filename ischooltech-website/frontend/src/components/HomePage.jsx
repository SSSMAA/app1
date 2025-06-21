// frontend/src/components/HomePage.jsx
import React from 'react';
import RegistrationForm from './RegistrationForm';
import { FaWhatsapp } from 'react-icons/fa'; // Existing import
import Footer from './Footer'; // Import the Footer component
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';


/**
 * HomePage component serves as the main landing page of the iSchoolTech website.
 * It aggregates various sections like Hero, Services, RegistrationForm, CTA, and Footer.
 * It also includes the LanguageSwitcher in the header and uses `react-i18next` for internationalization.
 */
const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      <div className="flex-grow"> {/* Wrapper to push footer down */}
        {/* Header/Navbar Placeholder ... */}
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">{t('siteTitle')}</h1>
          <LanguageSwitcher />
          {/* WhatsApp button in header as an alternative placement */}
          {/* <a
            href="https://wa.me/1234567890" // Replace 1234567890 with actual number
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg inline-flex items-center transition duration-300"
          >
            <FaWhatsapp className="mr-2" /> Contacter (WhatsApp)
          </a> */}
        </div>
      </header>

      {/* Hero Section ... */}
      <section className="py-12 md:py-20 bg-white">
        {/* ... content ... */}
         <div className="container mx-auto px-6 text-center">
              <h2 className="text-4xl font-bold mb-4 text-gray-700">
                {t('heroTitle')}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed md:w-2/3 mx-auto">
                {t('heroSubtitle')}
              </p>
              <a
                href="#registration" // Link to registration form section
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 mr-4"
              >
                {t('discoverCoursesBtn')}
              </a>
               <a
                href="https://wa.me/212000000000" // Replace with actual number, e.g., country code + number
                target="_blank"
                rel="noopener noreferrer"
                className="bg-whatsapp-green hover:bg-whatsapp-darkgreen text-white font-bold py-3 px-8 rounded-lg text-lg inline-flex items-center transition duration-300"
              >
                <FaWhatsapp size={24} className="mr-2" /> {t('heroWhatsAppBtn')}
              </a>
            </div>
      </section>

      {/* Services Section ... */}
      <section id="services" className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-700">
            {t('servicesTitle')}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Card 1: Programming */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h4 className="text-2xl font-semibold mb-3 text-blue-600">
                {t('serviceProgTitle')}
              </h4>
              <p className="text-gray-600 mb-4">
                {t('serviceProgDesc')}
              </p>
              <a href="#contact" className="text-green-500 hover:text-green-600 font-semibold">{t('learnMoreLink')}</a>
            </div>

            {/* Service Card 2: Robotics */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h4 className="text-2xl font-semibold mb-3 text-blue-600">
                {t('serviceRoboTitle')}
              </h4>
              <p className="text-gray-600 mb-4">
                {t('serviceRoboDesc')}
              </p>
              <a href="#contact" className="text-green-500 hover:text-green-600 font-semibold">{t('learnMoreLink')}</a>
            </div>

            {/* Service Card 3: Web Development (Example) */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h4 className="text-2xl font-semibold mb-3 text-blue-600">
                {t('serviceWebTitle')}
              </h4>
              <p className="text-gray-600 mb-4">
                {t('serviceWebDesc')}
              </p>
              <a href="#contact" className="text-green-500 hover:text-green-600 font-semibold">{t('learnMoreLink')}</a>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <RegistrationForm />

      {/* Call to Action / Contact Placeholder Section - Repurposed or Enhanced */}
      <section id="contact" className="py-12 md:py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-6">
            {t('ctaTitle')}
          </h3>
          <p className="text-lg mb-8">
            {t('ctaSubtitle')}
          </p>
          {/* Optional: Add mailto link here as well */}
          <a
            href="mailto:contact@ischooltech-example.com" // Replace with actual email
            className="border border-white hover:bg-white hover:text-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg inline-flex items-center transition duration-300"
          >
            {t('emailUsBtn')}
          </a>
        </div>
      </section>

      {/* Footer Placeholder ... (WhatsApp link could also go here) */}
      {/* <footer className="bg-gray-800 text-white p-6 text-center">
        <p>&copy; 2024 iSchoolTech. Tous droits réservés.</p>
      </footer> */}
      </div> {/* End of flex-grow wrapper */}
      <Footer /> {/* Add Footer component here */}
    </div>
  );
};

export default HomePage;
