import React from "react";
import styles from "../pages/styles.module.css";

function Feature({imgUrl, title, description}) {
    return (
        <div className="col col--4">
            <div className="text--center">
                {imgUrl && <img className={styles.featureImage} src={useBaseUrl(imgUrl)} alt={title}/>}
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
        </div>
    )
}

export default Feature
