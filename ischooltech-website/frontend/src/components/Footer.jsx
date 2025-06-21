// frontend/src/components/Footer.jsx
import React from 'react';
// Assuming react-icons might be used, e.g., FaFacebook, FaTwitter, FaInstagram
// If react-icons installation failed, these imports will cause issues until resolved.
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';

/**
 * Footer component for the iSchoolTech website.
 * Displays copyright information, project name, a short tagline,
 * social media links, and a direct WhatsApp contact button.
 * Uses `react-icons` for social media icons.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side: Copyright & Project Name */}
          <div className="text-center md:text-left">
            <h5 className="text-xl font-semibold text-white mb-2">iSchoolTech (Nom du Projet)</h5>
            <p className="text-sm">
              Apprendre. Coder. Innover.
            </p>
            <p className="text-xs mt-4">
              &copy; {currentYear} iSchoolTech. Tous droits réservés.
            </p>
          </div>

          {/* Right Side: Social Media Links & Contact */}
          <div className="text-center md:text-right">
            <p className="mb-3 font-semibold text-white">Suivez-nous & Contact</p>
            <div className="flex justify-center md:justify-end space-x-4 mb-4">
              <a href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
                <FaFacebookF size={20} />
              </a>
              <a href="https://twitter.com/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
                <FaTwitter size={20} />
              </a>
              <a href="https://instagram.com/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
                <FaInstagram size={20} />
              </a>
              <a href="https://linkedin.com/yourprofile" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
                <FaLinkedinIn size={20} />
              </a>
            </div>
            <a
              href="https://wa.me/212000000000" // Replace with actual number
              target="_blank"
              rel="noopener noreferrer"
              className="bg-whatsapp-green hover:bg-whatsapp-darkgreen text-white text-sm font-semibold py-2 px-3 rounded-md inline-flex items-center transition duration-300"
            >
              <FaWhatsapp className="mr-2" /> WhatsApp Direct
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
