import React from "react";
import supportersData from "../data/supporters";

const SupportersList = () => {
    return (
        <ul className="support-wrapper">
            {
                supportersData.map(({logo, alt}, index) => (
                    <li key={index}>
                        <img src={logo} alt={alt}/>
                    </li>
                ))
            }
        </ul>
    )
}

export default SupportersList
