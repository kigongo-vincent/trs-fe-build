export const S3_CORS_ENABLE = false;

export const imageToBase64 = async (url: string): Promise<string> => {
  if (!url) return "";

  // Ensure we're in browser environment
  if (typeof window === "undefined") {
    return "";
  }

  // Handle SVGs
  if (url.endsWith(".svg") || url.includes("image/svg+xml")) {
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
      return "";
    }
  }

  // Handle raster images (jpeg, png, etc)
  return new Promise((resolve, reject) => {
    let imgUrl = url;
    if (!S3_CORS_ENABLE) {
      imgUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    }
    const img = new Image();
    img.crossOrigin = "anonymous"; // Handle CORS
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      try {
        // Use original format if possible
        let format = "image/png";
        if (url.endsWith(".jpg") || url.endsWith(".jpeg"))
          format = "image/jpeg";
        const dataURL = canvas.toDataURL(format, 0.8);
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = imgUrl;
  });
};

const generateDynamicHtmlContent = async (content: string): Promise<string> => {
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
    console.error("Error processing content:", error);
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

export const generatePdf = async (content: string, filename?: string): Promise<void> => {
  // Ensure we're in browser environment
  if (typeof window === "undefined") {
    console.error("PDF generation is only available in browser environment");
    return;
  }

  try {
    const html2pdf = (await import("html2pdf.js")).default;
    // Generate the dynamic HTML content with Tailwind styling
    const htmlContent = await generateDynamicHtmlContent(content);

    // Use html2pdf.js to generate the PDF directly from HTML string
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: filename || "document.pdf",
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
    if (typeof window !== "undefined") {
      alert("Error generating PDF. Please try again.");
    }
  }
};

// Generate PDF as blob instead of downloading
export const generatePdfAsBlob = async (content: string): Promise<Blob> => {
  // Ensure we're in browser environment
  if (typeof window === "undefined") {
    throw new Error("PDF generation is only available in browser environment");
  }

  try {
    const html2pdf = (await import("html2pdf.js")).default;
    // Generate the dynamic HTML content with Tailwind styling
    const htmlContent = await generateDynamicHtmlContent(content);

    // Create a temporary iframe to render the full HTML document
    // This is necessary because html2pdf needs a properly rendered DOM
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    document.body.appendChild(iframe);
    
    // Wait for iframe to load
    await new Promise<void>((resolve) => {
      iframe.onload = () => {
        // Add small delay to ensure content is fully rendered
        setTimeout(() => resolve(), 100);
      };
      iframe.srcdoc = htmlContent;
    });
    
    // Get the content document
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      throw new Error('Failed to access iframe document');
    }
    
    // Wait for images to load - ensure they're fully loaded
    await new Promise<void>((resolve) => {
      // First, wait a bit for iframe to render
      setTimeout(() => {
        const images = iframeDoc.querySelectorAll('img');
        if (images.length === 0) {
          resolve();
          return;
        }
        
        let loadedCount = 0;
        const totalImages = images.length;
        const timeout = setTimeout(() => {
          // Resolve after timeout even if not all images loaded
          console.log(`Image loading timeout after 8s, ${loadedCount}/${totalImages} loaded`);
          resolve();
        }, 8000); // 8 second timeout
        
        const checkComplete = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            clearTimeout(timeout);
            console.log('All images loaded, waiting 500ms for rendering');
            setTimeout(() => resolve(), 500); // Longer delay after all images load
          }
        };
        
        images.forEach((img: HTMLImageElement, index: number) => {
          const isBase64 = img.src && img.src.startsWith('data:');
          
          // Base64 images should be immediately available
          if (isBase64) {
            console.log(`Image ${index} is base64, checking load status`);
            // For base64, they're embedded so check immediately
            // Wait a bit for browser to process the data URL
            setTimeout(() => {
              if (img.complete || img.naturalHeight > 0) {
                console.log(`Base64 image ${index} ready (complete: ${img.complete}, height: ${img.naturalHeight})`);
                checkComplete();
              } else {
                // Set up load handlers as backup
                img.onload = () => {
                  console.log(`Base64 image ${index} loaded via event`);
                  checkComplete();
                };
                img.onerror = () => {
                  console.error(`Base64 image ${index} failed to load`);
                  checkComplete(); // Continue even if fails
                };
                // Force a check after a short delay
                setTimeout(() => {
                  if (img.naturalHeight > 0 || img.complete) {
                    checkComplete();
                  }
                }, 100);
              }
            }, 100);
          } else {
            // Regular URL images
            console.log(`Image ${index} is URL: ${img.src}`);
            // Set crossOrigin for CORS
            img.crossOrigin = 'anonymous';
            
            if (img.complete && img.naturalHeight !== 0) {
              console.log(`Image ${index} already complete`);
              checkComplete();
            } else {
              img.onload = () => {
                if (img.naturalHeight > 0) {
                  console.log(`Image ${index} loaded successfully`);
                  checkComplete();
                }
              };
              img.onerror = () => {
                console.error(`Image ${index} failed to load`);
                checkComplete(); // Continue even if image fails
              };
              
              // If not loaded, try to trigger load
              if (!img.complete && img.src) {
                const src = img.src;
                // Force reload
                img.src = '';
                setTimeout(() => {
                  img.src = src;
                }, 50);
              }
            }
          }
        });
      }, 200); // Initial delay for iframe rendering
    });
    
    // Get the body element from the iframe
    const bodyElement = iframeDoc.body || iframeDoc.querySelector('body');
    if (!bodyElement) {
      document.body.removeChild(iframe);
      throw new Error('Failed to find body element in iframe');
    }

    try {
      // Use jsPDF and html2canvas directly for better control
      const jsPDFLib = (await import("jspdf")).default;
      const html2canvasLib = (await import("html2canvas")).default;
      const html2canvas = (html2canvasLib as any).default || html2canvasLib;

      // Generate canvas from HTML element - capture full scroll height
      const canvas = await html2canvas(bodyElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        height: bodyElement.scrollHeight,
        width: bodyElement.scrollWidth,
        windowWidth: bodyElement.scrollWidth,
        windowHeight: bodyElement.scrollHeight,
      });

      // Create PDF
      const pdf = new jsPDFLib({
        unit: "in",
        format: "letter",
        orientation: "portrait",
        compress: true,
      });

      // Calculate dimensions with proper margins
      const pageWidth = 8.5; // Letter width in inches
      const pageHeight = 11; // Letter height in inches
      const marginLeft = 0.5; // Left margin in inches
      const marginTop = 0.5; // Top margin in inches
      const marginRight = 0.5; // Right margin in inches
      const marginBottom = 0.5; // Bottom margin in inches
      const contentWidth = pageWidth - marginLeft - marginRight;
      const contentHeight = pageHeight - marginTop - marginBottom;
      
      // Calculate scale to fit content width while maintaining aspect ratio
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      // Check if content fits on one page
      if (imgHeight <= contentHeight) {
        // Content fits on one page - add it directly
        pdf.addImage(imgData, "JPEG", marginLeft, marginTop, imgWidth, imgHeight);
      } else {
        // Content needs multiple pages - split it correctly
        let yPosition = 0;
        let pageNumber = 0;
        
        while (yPosition < canvas.height) {
          if (pageNumber > 0) {
            pdf.addPage();
          }
          
          // Calculate how much of the image to show on this page
          const remainingHeight = canvas.height - yPosition;
          const displayHeight = Math.min(remainingHeight, (contentHeight * canvas.width) / imgWidth);
          
          // Calculate the source rectangle and destination
          const sourceY = yPosition;
          const sourceHeight = displayHeight;
          
          // Create a temporary canvas for this page slice
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(sourceHeight, canvas.height - sourceY);
          const pageCtx = pageCanvas.getContext('2d');
          
          if (pageCtx) {
            pageCtx.drawImage(canvas, 0, sourceY, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
            const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.95);
            const pageImgHeight = (pageCanvas.height * imgWidth) / canvas.width;
            pdf.addImage(pageImgData, "JPEG", marginLeft, marginTop, imgWidth, pageImgHeight);
          }
          
          yPosition += sourceHeight;
          pageNumber++;
        }
      }

      // Get PDF as blob
      const pdfBlob = pdf.output('blob');
      
      if (!pdfBlob || !(pdfBlob instanceof Blob) || pdfBlob.size === 0) {
        // Fallback: try arraybuffer
        const arrayBuffer = pdf.output('arraybuffer');
        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
          // Clean up temporary iframe
          document.body.removeChild(iframe);
          return blob;
        }
        // Clean up temporary iframe
        document.body.removeChild(iframe);
        throw new Error('Generated PDF is empty');
      }
      
      // Clean up temporary iframe
      document.body.removeChild(iframe);
      return pdfBlob;
    } catch (error) {
      // Clean up temporary iframe even on error
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error generating PDF blob:", error);
    throw error;
  }
};
