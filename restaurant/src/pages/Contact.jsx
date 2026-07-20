import React ,{useEffect}from "react";
import { useNavigate } from "react-router-dom";
import GetCurrUser from "../util/GetcurrUser";
import "./Contact.css";

function Contact() {
const { token } = GetCurrUser();
const navigate = useNavigate();
console.log(GetCurrUser());

  // useEffect(()=>{
  //   if(token){
  //     navigate('/dashboard');
  //   }
  // },[navigate])

  return (
    <section className="contact">
      <h1 className="contact-title">Get in Touch</h1>
      <p className="contact-subtitle">
        We’d love to hear from you! Whether it’s a reservation, feedback, or just a hello.
      </p>
<div>
</div>
      <div className="contact-container">
        <div className="contact-form">
          <h2>Contact Form</h2>
          <form>
            <div className="input-box">
              <input type="text" placeholder="Your Name" required />
            </div>
            <div className="input-box">
              <input type="email" placeholder="Your Email" required />
            </div>
            <div className="input-box">
              <textarea placeholder="Your Message" rows="5" required></textarea>
            </div>
            <button className="sbtn" type="submit">Send Message</button>
          </form>
        </div>

        <div className="contact-map">
          <h2>Our Location</h2>
          <iframe
            title="Restaurant Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.214!2d85.324!3d27.717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQzJzAxLjAiTiA4NcKwMTknMjYuMCJF!5e0!3m2!1sen!2snp!4v1620000000000"
            width="100%"
            height="250"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>

        <div className="contact-phone">
          <h2>Call Us</h2>
          <p>📞 <a href="tel:+977123456789">+977 123456789</a></p>
        </div>
      </div>
    </section>
  );
}

export default Contact;
