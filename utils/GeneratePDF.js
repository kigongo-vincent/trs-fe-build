
export const S3_CORS_ENABLE = false;

export const imageToBase64 = async (url) => {
  if (!url) return '';
  // Handle SVGs
  if (url.endsWith('.svg') || url.includes('image/svg+xml')) {
    try {
      let fetchUrl = url;
      if (!S3_CORS_ENABLE) {
        fetchUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      }
      const res = await fetch(fetchUrl);
      const svgText = await res.text();
      const base64 = btoa(unescape(encodeURIComponent(svgText)));
      return `data:image/svg+xml;base64,${base64}`;
    } catch (e) {
      return '';
    }
  }
  // Handle raster images (jpeg, png, etc)
  return new Promise((resolve, reject) => {
    let imgUrl = url;
    if (!S3_CORS_ENABLE) {
      imgUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      try {
        // Use original format if possible
        let format = 'image/png';
        if (url.endsWith('.jpg') || url.endsWith('.jpeg')) format = 'image/jpeg';
        const dataURL = canvas.toDataURL(format, 0.8);
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = imgUrl;
  });
  // Handle raster images (jpeg, png, etc)
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      try {
        // Use original format if possible
        let format = 'image/png';
        if (url.endsWith('.jpg') || url.endsWith('.jpeg')) format = 'image/jpeg';
        const dataURL = canvas.toDataURL(format, 0.8);
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
};

const generateDynamicHtmlContent = async (content) => {
    try {
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            /* Additional custom styles for PDF generation */
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
            
            /* Ensure proper font rendering in PDF */
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            
            /* Handle page breaks */
            .page-break {
              page-break-after: always;
            }
            
            .avoid-break {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body class="bg-white">
          <div class="container mx-auto px-4 py-8 max-w-4xl">
            ${content}
          </div>
        </body>
        </html>
      `;
    } catch (error) {
      console.error('Error processing content:', error);
      // Fallback to original content without image processing
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            }
            .page-break {
              page-break-after: always;
            }
            .avoid-break {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body class="bg-white">
          <div class="container mx-auto px-4 py-8 max-w-4xl">
            ${content}
          </div>
        </body>
        </html>
      `;
    }
  };

export const generatePdf = async (content) => {
  try {
    const html2pdf = (await import('html2pdf.js')).default;
    // Generate the dynamic HTML content with Tailwind styling
    const htmlContent = await generateDynamicHtmlContent(content);

    // Use html2pdf.js to generate the PDF directly from HTML string
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: "tailwind-styled-content.pdf",
      image: {
        type: "jpeg",
        quality: 0.9,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        height: null,
        width: null,
      },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Generate and save the PDF directly from HTML string
    await html2pdf().set(options).from(htmlContent).save();
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF. Please try again.");
  }
};