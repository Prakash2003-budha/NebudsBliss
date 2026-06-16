import React from "react"
import Layout from "../../components/layout/layout"
import styles from "./home.page.module.scss"

const Homepage: React.FC=()=>{
    return(
        <Layout>
            <div className={styles.container}>
                <div className={styles.slideposters}>

                </div>
            </div>
        </Layout>
    )
}
export default Homepage