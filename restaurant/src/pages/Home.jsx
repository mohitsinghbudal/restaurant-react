import React from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <HeroSection />

      <section className="home-section">
  <div className="section-header">
    <h2>About Gourmet Haven</h2>
    <div className="section-divider"></div>

    <p>
      At <strong>Gourmet Haven</strong>, we believe that dining is more than
      just enjoying a meal—it's about creating unforgettable memories. Every
      dish is thoughtfully prepared using fresh ingredients, authentic recipes,
      and a passion for culinary excellence.
    </p>

    <p>
      Whether you're planning a romantic dinner, a family celebration, a
      business meeting, or simply looking for a relaxing evening with friends,
      our elegant ambiance and attentive service ensure a truly exceptional
      experience from the moment you walk through our doors.
    </p>

    <p>
      Our talented chefs combine traditional flavors with modern culinary
      techniques to create dishes that delight every palate. Paired with our
      warm hospitality and comfortable atmosphere, Gourmet Haven has become a
      destination where guests return again and again.
    </p>

    <div className="about-highlights">
      <div className="highlight-item">
        <h3>10+</h3>
        <span>Years of Excellence</span>
      </div>

      <div className="highlight-item">
        <h3>100+</h3>
        <span>Delicious Dishes</span>
      </div>

      <div className="highlight-item">
        <h3>5000+</h3>
        <span>Happy Customers</span>
      </div>

      <div className="highlight-item">
        <h3>★★★★★</h3>
        <span>Premium Service</span>
      </div>
    </div>
  </div>
</section>

      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose Us</h2>
          <div className="section-divider"></div>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Fresh Ingredients</h3>
            <p>
              Every meal is prepared using premium ingredients sourced daily.
            </p>
          </div>

          <div className="feature-card">
            <h3>Luxury Dining</h3>
            <p>
              Elegant interiors designed for memorable dining experiences.
            </p>
          </div>

          <div className="feature-card">
            <h3>Professional Chefs</h3>
            <p>
              Our experienced chefs blend international standards with local
              flavors.
            </p>
          </div>

          <div className="feature-card">
            <h3>QR Ordering</h3>
            <p>
              Scan your table QR code and place orders seamlessly without
              waiting.
            </p>
          </div>
        </div>
      </section>

      <section className="special-section">
        <div className="section-header">
          <h2>Signature Dishes</h2>
          <div className="section-divider"></div>
        </div>

        <div className="dish-grid">
          <div className="dish-card">
            <h3>Buff Steamed Momo</h3>
            <p>
              Authentic Nepali dumplings served with our signature sesame
              tomato chutney.
            </p>
          </div>

          <div className="dish-card">
            <h3>Chicken Biryani</h3>
            <p>
              Aromatic basmati rice layered with tender chicken and traditional
              spices.
            </p>
          </div>

          <div className="dish-card">
            <h3>Grilled Steak</h3>
            <p>
              Perfectly grilled premium steak served with seasonal vegetables.
            </p>
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="section-header">
          <h2>Our Services</h2>
          <div className="section-divider"></div>
        </div>

        <div className="service-grid">
          <div className="service-item">Restaurant Dining</div>
          <div className="service-item">Table Reservation</div>
          <div className="service-item">QR Code Ordering</div>
          <div className="service-item">Private Events</div>
          <div className="service-item">Hotel Accommodation</div>
          <div className="service-item">24/7 Customer Support</div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Reserve Your Table Today</h2>
        <p>
          Experience exceptional hospitality and delicious cuisine at Gourmet
          Haven.
        </p>

        <button onClick={() => navigate("/table")}>
          Book a Table
        </button>
      </section>

      <Footer />
    </>
  );
}

export default Home;