import React from "react";

function Feature({imgUrl, title, description}) {
    return (
        <div className="col col--3">
            <div className="text--center">
                {imgUrl && <img className="featureImage" src={useBaseUrl(imgUrl)} alt={title}/>}
            </div>
            <div className="container">
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
        </div>
    )
}

export default Feature
