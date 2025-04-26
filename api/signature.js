import { generateSignature } from './cloudinary';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timestamp } = req.body;
    
    if (!timestamp) {
      return res.status(400).json({ error: 'Timestamp is required' });
    }

    const signature = generateSignature(timestamp);
    res.status(200).json({ signature });
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
} 