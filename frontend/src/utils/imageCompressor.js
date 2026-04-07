// Image compression using Canvas API — for low bandwidth
export const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
  return new Promise((resolve) => {
    // Skip non-images or already small files
    if (!file.type.startsWith('image/') || file.size < 100 * 1024) {
      return resolve(file);
    }
    // Skip GIFs (would lose animation)
    if (file.type === 'image/gif') return resolve(file);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Scale down if wider than maxWidth
      if (width > maxWidth) {
        height = (height / width) * maxWidth;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            // Compressed version is smaller — use it
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            // Original is smaller — keep it
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => resolve(file); // Fallback to original
    img.src = URL.createObjectURL(file);
  });
};

// Generate a tiny thumbnail for progressive loading
export const generateThumbnail = (file, size = 40, quality = 0.3) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(null);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const aspect = img.width / img.height;
      canvas.width = size;
      canvas.height = size / aspect;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
};
