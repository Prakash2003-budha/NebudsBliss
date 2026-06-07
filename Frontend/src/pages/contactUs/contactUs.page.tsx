import React, { useState } from "react";
import Layout from "../../components/layout/layout";
import styles from "./contact.page.module.scss";
import { MAPURL } from "../../constants/constants";
import { toast } from "react-toastify";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for your backend submission logic
    toast.success("Thank you! Your message has been sent.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <Layout>
      <div className={styles.container}>
        
        {/* Page Header */}
        <div className={styles.header}>
          <h1>Get in Touch</h1>
          <p>We would love to hear from you. Drop us a line or visit us.</p>
        </div>

        <div className={styles.contentWrapper}>
          
          {/* Left Column: Contact Info & Form */}
          <div className={styles.leftColumn}>
            
            {/* Contact Details */}
            <div className={styles.contactDetails}>
              <div className={styles.detailBlock}>
                <h3>Contact Information</h3>
                <p><strong>Owner:</strong> Shiraj Shrestha</p>
                <p><strong>Phone:</strong> <a href="tel:9864120605">+977 9864120605</a></p>
              </div>

              <div className={styles.detailBlock}>
                <h3>Email Us</h3>
                <p><strong>Business:</strong> <a href="mailto:Nebudsbliss@gmail.com">Nebudsbliss@gmail.com</a></p>
                <p><strong>Direct:</strong> <a href="mailto:shiraj94@gmail.com">shiraj 94@gmail.com</a></p>
              </div>
            </div>

            {/* Contact Form */}
            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Jane Doe"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="jane@example.com"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="How can we help?"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Write your message here..."
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                Send Message
              </button>
            </form>
          </div>

          {/* Right Column: Google Map */}
          <div className={styles.rightColumn}>
            <div className={styles.mapCard}>
              <h3>Visit Our Location</h3>
              {/* Renders your exact iframe string from constants.tsx */}
              <div 
                className={styles.mapContainer}
                dangerouslySetInnerHTML={{ __html: MAPURL.LOCATION }} 
              />
              <div className={styles.mapLink}>
                <a href={MAPURL.MAP} target="_blank" rel="noopener noreferrer">
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;