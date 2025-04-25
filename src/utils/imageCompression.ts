
import imageCompression from 'browser-image-compression';

export async function compressImage(file: File, maxSizeMB = 5): Promise<File> {
  const options = {
    maxSizeMB: maxSizeMB,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8
  };
  
  try {
    // If file is already small enough, don't compress it further
    if (file.size <= maxSizeMB * 1024 * 1024) {
      console.log("File is already small enough, skipping compression");
      return file;
    }
    
    console.log(`Compressing image: ${file.name}, original size: ${file.size} bytes`);
    const compressedFile = await imageCompression(file, options);
    console.log(`Compression complete: new size: ${compressedFile.size} bytes`);
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return original file if compression fails
    console.log('Returning original file due to compression failure');
    return file;
  }
}
