
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 py-6 mt-8 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-600 font-roboto mb-4 md:mb-0">
            Made with ❤️ by {' '}
            <a 
              href="https://raufjatoi.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-funzone-purple hover:text-funzone-dark-purple underline transition-colors duration-300"
            >
              Abdul Rauf Jatoi
            </a>
          </p>
          
          <div className="flex space-x-4">
            <a 
              href="#" 
              className="text-gray-600 hover:text-funzone-purple transition-colors duration-300 font-roboto"
            >
              Terms
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-funzone-purple transition-colors duration-300 font-roboto"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="text-gray-600 hover:text-funzone-purple transition-colors duration-300 font-roboto"
            >
              Contact
            </a>
          </div>
        </div>
        <div className="mt-4 text-center text-gray-500 text-sm font-roboto">
          © {new Date().getFullYear()} FunZone. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
