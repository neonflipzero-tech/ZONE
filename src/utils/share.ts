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
    } catch (error) {
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

  try {
    // Add a slight delay to ensure animations/fonts are loaded
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const blob = await toBlob(element, { 
      cacheBust: true,
      backgroundColor: '#0a0a0a', // Match background color
      pixelRatio: 3, // Make image HD
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
      // Fallback: Download the image
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
    }
  } catch (error) {
    console.error('Error sharing image:', error);
    // Fallback to text only
    return shareContent(title, text);
  }
};
