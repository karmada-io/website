import React from "react";
import GitHubButton from "react-github-btn";

const GhButton = ({ children, href }) => {
    return (
        <GitHubButton
            href="https://github.com/karmada-io/karmada"
            data-icon="octicon-star"
            data-size="large"
            data-show-count="true"
            aria-label="Star Karmada on GitHub">
            Star
        </GitHubButton>
    );
};

export default GhButton
