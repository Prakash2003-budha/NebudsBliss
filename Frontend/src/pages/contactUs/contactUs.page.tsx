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
      // TODO: replace with real backend submission
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
        {/* Header */}
        <header className={styles.header}>
          <span className={styles.eyebrow}>Contact</span>
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
              <div className={styles.detailBlock}>
                <h3>Contact Information</h3>
                <p>
                  <strong>Owner:</strong> Shiraj Shrestha
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+9779864120605">+977 9864120605</a>
                </p>
              </div>

              <div className={styles.detailBlock}>
                <h3>Email Us</h3>
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
              <h3>Visit Our Location</h3>
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
