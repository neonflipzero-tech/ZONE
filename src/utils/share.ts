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
          alert('Copied to clipboard!');
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
      alert('Copied to clipboard!');
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

  let blob: Blob | null = null;
  try {
    // Generate image quickly to preserve user gesture token
    blob = await toBlob(element, { 
      backgroundColor: '#0a0a0a', // Match background color
      pixelRatio: 1, // Reduced to 1 to speed up generation and preserve gesture
      style: {
        transform: 'scale(1)', // Ensure no weird scaling issues
        margin: '0',
      }
    });
    
    if (!blob) throw new Error('Failed to generate image blob');

    const file = new File([blob], 'zone-share.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return true;
    } else {
      throw new Error('Cannot share files');
    }
  } catch (error: any) {
    // Ignore user cancellation
    if (error.name === 'AbortError' || error.message?.includes('canceled')) {
      return false;
    }

    // If it's a gesture error or cannot share files, try to download instead
    if (error.name === 'NotAllowedError' || error.message?.includes('user gesture') || error.message === 'Cannot share files') {
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
          
          // Also copy text
          await navigator.clipboard.writeText(`${title}\n${text}\n${window.location.origin}`);
          alert('Gambar berhasil diunduh dan teks disalin!');
          return true;
        } catch (downloadError) {
          console.error('Error downloading image:', downloadError);
        }
      }
    } else {
      console.error('Error sharing image:', error);
    }
    
    // Ultimate fallback to text only
    return shareContent(title, text);
  }
};
