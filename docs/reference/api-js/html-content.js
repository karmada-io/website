import React from 'react';

function HtmlContent({htmlContent}) {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
}

export default HtmlContent