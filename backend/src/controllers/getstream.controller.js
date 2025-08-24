import { StreamClient } from '@stream-io/node-sdk';

// Get API keys from environment variables
// Make sure these are set correctly in your backend .env file
const getStreamApiKey = process.env.GETSTREAM_API_KEY;
const getStreamApiSecret = process.env.GETSTREAM_API_SECRET;

// IMPORTANT: Check if the keys are defined
if (!getStreamApiKey || !getStreamApiSecret) {
  console.error("ERROR: GETSTREAM_API_KEY or GETSTREAM_API_SECRET is not set in your .env file.");
  // In a real app, you might handle this more gracefully, but exiting is good for development
  process.exit(1); 
}

// Initialize the GetStream Server Client
const serverClient = new StreamClient(getStreamApiKey, getStreamApiSecret);

// Controller function to generate a secure user token
export const generateToken = (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required in the request body.' });
    }

    // Use the StreamClient to create a token for the given userId
    const token = serverClient.createToken(userId);
    res.json({ token });
  } catch (error) {
    console.error('Backend Error: Failed to generate token:', error);
    res.status(500).json({ message: 'Failed to generate token due to server error.', error: error.message });
  }
};
