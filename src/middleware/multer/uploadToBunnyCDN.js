
import axios from "axios";

const BUNNY_STORAGE_ZONE = "lavisheventzz-bengaluru";
const BUNNY_ACCESS_KEY = "70f17657-01af-4272-a72aaecfd7f3-300e-401b";
const BUNNY_CDN_HOST = "lavisheventzz-bengaluru.b-cdn.net";

const handleMultipleFileUpload = async (files, folder = "ReviewImages") => {
  const uploadResults = [];

  for (const file of files) {
    const encodedFolder = encodeURI(folder.trim());
    const encodedFileName = encodeURIComponent(`${Date.now()}-${file.originalname}`);
    const fullPath = `${encodedFolder}/${encodedFileName}`;

    try {
      const response = await axios.put(
        `https://uk.storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${fullPath}`,
        file.buffer, // memory buffer
        {
          headers: {
            AccessKey: BUNNY_ACCESS_KEY,
            "Content-Type": "application/octet-stream",
          },
        }
      );

      if (response.status === 201) {
        uploadResults.push(`https://${BUNNY_CDN_HOST}/${fullPath}`);
      } else {
        console.error(`Upload failed for ${file.originalname}: ${response.status}`);
        uploadResults.push(null);
      }
    } catch (err) {
      console.error(`Upload failed for ${file.originalname}:`, err.message);
      uploadResults.push(null);
    }
  }

  return uploadResults;
};

export default handleMultipleFileUpload;
