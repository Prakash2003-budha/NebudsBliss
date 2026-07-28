import React from 'react';
import styles from "./aboutUs.page.module.scss";
import Layout from '../../components/layout/layout';
import logo from '../../img/logo/logo.transparent.png'

const AboutUsPage: React.FC = () => {
  return (
    <Layout>
        <div className={styles.container}>
            <div className={styles.header}>
                <img src={logo} alt="" />
            </div>
            <div className={styles.subhead}>
                <h1>About Us</h1>
            </div>
            
        </div>
    </Layout>
  );
};

export default AboutUsPage;