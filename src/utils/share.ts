import { toBlob } from 'html-to-image';

export const shareContent = async (title: string, text: string) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: window.location.origin,
      });
      return true;
    } catch (error: any) {
      // Ignore user cancellation
      if (error.name === 'AbortError' || error.message?.includes('canceled')) {
        return false;
      }
      
      // If gesture expired or not allowed, fallback to clipboard
      if (error.name === 'NotAllowedError' || error.message?.includes('user gesture')) {
        try {
          await navigator.clipboard.writeText(`${title}\n${text}\n${window.location.origin}`);
          window.dispatchEvent(new CustomEvent('zone-notification', { 
            detail: { message: 'Copied to clipboard!', type: 'success' } 
          }));
          return true;
        } catch (clipboardError) {
          console.error('Error copying to clipboard:', clipboardError);
          return false;
        }
      }

      console.error('Error sharing:', error);
      return false;
    }
  } else {
    try {
      await navigator.clipboard.writeText(`${title}\n${text}\n${window.location.origin}`);
      window.dispatchEvent(new CustomEvent('zone-notification', { 
        detail: { message: 'Copied to clipboard!', type: 'success' } 
      }));
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }
};

export const shareElementAsImage = async (elementId: string, title: string, text: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    return shareContent(title, text);
  }

  // Detect if we are in a WebView (common in APKs)
  const isWebView = /wv|WebView|Android.*(Messenger|FBAN|FBAV|Instagram|Line)/i.test(navigator.userAgent);

  let blob: Blob | null = null;
  try {
    // Generate image quickly to preserve user gesture token
    blob = await toBlob(element, { 
      backgroundColor: '#0a0a0a', // Match background color
      pixelRatio: 2, // Increased for better quality
      filter: (node) => {
        // Ignore elements with data-html2canvas-ignore attribute
        if (node instanceof HTMLElement && node.hasAttribute('data-html2canvas-ignore')) {
          return false;
        }
        return true;
      },
      style: {
        transform: 'scale(1)', 
        margin: '0',
      }
    });
    
    if (!blob) throw new Error('Failed to generate image blob');

    const file = new File([blob], 'zone-share.png', { type: 'image/png' });

    // Try to share the file
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        // In some WebViews, sharing files AND text simultaneously causes issues
        // We try sharing everything first
        await navigator.share({
          title,
          text,
          files: [file],
        });
        return true;
      } catch (shareError: any) {
        // If it failed with text, try sharing ONLY the file
        if (shareError.name !== 'AbortError') {
          await navigator.share({
            files: [file],
          });
          return true;
        }
        throw shareError;
      }
    } else {
      throw new Error('Cannot share files');
    }
  } catch (error: any) {
    // Ignore user cancellation
    if (error.name === 'AbortError' || error.message?.includes('canceled')) {
      return false;
    }

    // Fallback for APK/WebView or unsupported file sharing
    if (blob) {
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zone-share.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Also copy text to clipboard as a secondary action
        try {
          await navigator.clipboard.writeText(`${title}\n${text}\n${window.location.origin}`);
        } catch (e) {
          console.warn('Clipboard fallback failed');
        }

        window.dispatchEvent(new CustomEvent('zone-notification', { 
          detail: { 
            message: isWebView 
              ? 'Pilih "Save" untuk simpan gambar & teks disalin!' 
              : 'Gambar diunduh & teks disalin!', 
            type: 'success' 
          } 
        }));
        return true;
      } catch (downloadError) {
        console.error('Error downloading image:', downloadError);
      }
    }
    
    // Ultimate fallback to text only
    return shareContent(title, text);
  }
};
