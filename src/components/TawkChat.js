import React, { useEffect } from 'react';

const TawkChat = () => {
  useEffect(() => {
    // Insert Tawk.to script
    const s1 = document.createElement('script');
    const s0 = document.getElementsByTagName('script')[0];
    
    s1.async = true;
    s1.src = 'https://embed.tawk.to/683598df9e6ff01910851949/1is8lqatr';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    // Initialize Tawk API if needed
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Add the script to the document 
    s0.parentNode.insertBefore(s1, s0);

    // Cleanup function to remove the script when component unmounts
    return () => {
      if (s1 && s1.parentNode) {
        s1.parentNode.removeChild(s1);
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default TawkChat;
