import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const {
  BUNNY_STORAGE_ZONE,
  BUNNY_ACCESS_KEY,
  BUNNY_CDN_HOST,
} = process.env;

export const uploadSingleFileToBunny = async (file, folder = "BlogImages") => {
  if (!file || !file.buffer) return null;

  const encodedFolder = encodeURI(folder.trim());
  const encodedFileName = encodeURIComponent(`${Date.now()}-${file.originalname}`);
  const fullPath = `${encodedFolder}/${encodedFileName}`;

  try {
    const response = await axios.put(
      `https://uk.storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${fullPath}`,
      file.buffer,
      {
        headers: {
          AccessKey: BUNNY_ACCESS_KEY,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    if (response.status === 201) {
      return `https://${BUNNY_CDN_HOST}/${fullPath}`;
    } else {
      console.error(`Upload failed for ${file.originalname}: ${response.status}`);
      return null;
    }
  } catch (err) {
    console.error(`Upload failed for ${file.originalname}:`, err.message);
    return null;
  }
};
