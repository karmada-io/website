import React, { useState, useEffect } from 'react';

function HTMLRenderer() {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // Fetch the HTML content from the server
    fetch('/docs.html')
      .then((response) => response.text())
      .then((data) => setHtmlContent(data))
      .catch((error) => console.error('Error fetching HTML:', error));
  }, []);

  return (
    <div>
      {/* Render the fetched HTML content */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </div>
  );
}

export default HTMLRenderer;