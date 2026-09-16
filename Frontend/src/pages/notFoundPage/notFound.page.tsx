import React from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/layout";
import styles from "./notFound.page.module.scss";

const NotFoundPage: React.FC = () => (
  <Layout>
    <section className={styles.container} aria-labelledby="not-found-title">
      <p className={styles.code}>404</p>
      <h1 id="not-found-title">Page not found</h1>
      <p className={styles.message}>
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className={styles.homeLink}>
        Back to home
      </Link>
    </section>
  </Layout>
);

export default NotFoundPage;
