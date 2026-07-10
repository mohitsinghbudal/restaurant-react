import React, { useState, useEffect } from 'react';
import HeroSection  from '../components/HeroSection';
import Footer from '../components/Footer';


function Home() {
  const [loggedin, setLoggedin] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setLoggedin(!!token); 
  }, []);

  return (
    <>
    <HeroSection/>
    
      {loggedin ? (
        <h1>✅ User is logged in</h1>
      ) : (
        <div>Home (Guest)</div>
      )}
      <Footer/>
    </>
  );
}

export default Home;
