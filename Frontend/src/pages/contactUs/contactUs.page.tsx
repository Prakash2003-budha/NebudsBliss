import React, { useState } from "react";
import Layout from "../../components/layout/layout";
import styles from "./contact.page.module.scss";
import { MAPURL } from "../../constants/constants";
import { toast } from "react-toastify";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Simulated network request
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Thank you! Your message has been sent.");
      setFormData(INITIAL_STATE);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Contact Us</span>
          <h1>Get in Touch</h1>
          <p>
            We would love to hear from you. Drop us a line, give us a call,
            or visit us in person.
          </p>
        </header>

        <div className={styles.contentWrapper}>
          {/* Left: Info + Form */}
          <div className={styles.leftColumn}>
            
            <div className={styles.contactDetails}>
              {/* Phone Block */}
              <div className={styles.detailBlock}>
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  Call Us
                </h3>
                <p>
                  <strong>Owner:</strong> Shiraj Shrestha
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+9779864120605">+977 9864120605</a>
                </p>
              </div>

              {/* Email Block */}
              <div className={styles.detailBlock}>
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  Email Us
                </h3>
                <p>
                  <strong>Business:</strong>{" "}
                  <a href="mailto:Nebudsbliss@gmail.com">
                    Nebudsbliss@gmail.com
                  </a>
                </p>
                <p>
                  <strong>Direct:</strong>{" "}
                  <a href="mailto:shiraj94@gmail.com">shiraj94@gmail.com</a>
                </p>
              </div>
            </div>

            <form className={styles.contactForm} onSubmit={handleSubmit} noValidate>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows={5}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Right: Map */}
          <aside className={styles.rightColumn}>
            <div className={styles.mapCard}>
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Visit Our Location
              </h3>
              <div
                className={styles.mapContainer}
                dangerouslySetInnerHTML={{ __html: MAPURL.LOCATION }}
              />
              <div className={styles.mapLink}>
                <a
                  href={MAPURL.MAP}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;