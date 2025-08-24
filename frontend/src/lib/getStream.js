// frontend/lib/getStream.js
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import axios from 'axios';

export const initializeStreamClient = async (userId) => {
  try {
    const res = await axios.post('http://localhost:5001/api/getstream/generate-token', { userId });
    const token = res.data.token;

    const client = new StreamVideoClient({
      apiKey: import.meta.env.VITE_GETSTREAM_API_KEY, // Put this key in your .env file
      user: {
        id: userId,
        name: userId,
      },
      token,
    });

    return client;
  } catch (err) {
    console.error("Stream initialization failed:", err);
    return null;
  }
};
