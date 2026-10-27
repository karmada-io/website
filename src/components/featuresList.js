import React from "react";
import styles from "../pages/styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";

function Feature({imgUrl, title, description}) {
    return (
        <>
            <div className="text--center">
                {imgUrl && <img className={styles.featureImage} src={useBaseUrl(imgUrl)} alt={title}/>}
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
        </>
    )
}

export default Feature
