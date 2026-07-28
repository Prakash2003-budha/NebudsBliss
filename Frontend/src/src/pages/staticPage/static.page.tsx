import React from "react";
import Layout from "../../components/layout/layout";
import styles from "./static.page.module.scss";

interface StaticPageProps {
  title: string;
  updatedLabel?: string;
  children: React.ReactNode;
}

export const StaticPage: React.FC<StaticPageProps> = ({ title, updatedLabel, children }) => (
  <Layout>
    <div className={styles.container}>
      <h1>{title}</h1>
      {updatedLabel && <p className={styles.updated}>{updatedLabel}</p>}
      <div className={styles.body}>{children}</div>
    </div>
  </Layout>
);

export const TermsPage: React.FC = () => (
  <StaticPage title="Terms of Service" updatedLabel="Last updated: 2026">
    <p>
      By placing an order on NebudsBliss you agree to pay the listed price for the items in
      your cart, provide accurate delivery details, and accept our current payment and
      delivery process for orders shipped within Nepal.
    </p>
    <p>
      Orders are processed once payment is confirmed (for bank transfer) or on request (for
      cash on delivery). We reserve the right to cancel orders that cannot be fulfilled and
      will contact you using the phone number or email you provide at checkout.
    </p>
    <p>
      Product prices, descriptions, and availability are subject to change without notice.
      Continued use of this site after changes to these terms constitutes acceptance of the
      updated terms.
    </p>
  </StaticPage>
);

export const PrivacyPage: React.FC = () => (
  <StaticPage title="Privacy Policy" updatedLabel="Last updated: 2026">
    <p>
      We collect the account and order details you provide directly — name, email, phone,
      address, and order history — to create your account, process orders, and communicate
      with you about deliveries.
    </p>
    <p>
      We do not sell your personal information. Your details are used only to operate the
      NebudsBliss store and are stored securely on our servers.
    </p>
    <p>
      You can request access to, correction of, or deletion of your account data at any time
      by contacting us through the Contact page.
    </p>
  </StaticPage>
);
