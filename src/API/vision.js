// quickstart.js

// Import the required dependencies using ES modules syntax
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Create and export the function to perform label detection
export async function quickstart(imagelink) {
  try {
    // Creates a client for the Google Cloud Vision API
    const client = new ImageAnnotatorClient();

    // Performs label detection on the image file
    const [result] = await client.labelDetection(imagelink);
    const labels = result.labelAnnotations;
    console.log('Labels:');
    labels.forEach(label => console.log(label.description));
    return labels.map(label => label.description);
  } catch (error) {
    console.error('Error performing label detection:', error);
    return [];
  }
}
