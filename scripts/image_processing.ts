import fs from 'fs';
import path from 'path';
import * as https from 'https';
import * as http from 'http';
import dotenv from 'dotenv';
import Replicate, { Prediction } from 'replicate';

dotenv.config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

const modelVersions = {
  // enlarge image
  'nightmareai/real-esrgan': 'f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa',
  // get color depth map
  'garg-aayush/ml-depth-pro': '63efd78f11d91e3236df416c894f5b49e996271c3f96f98ac806288a5da59db8',
  // get gray depth map
  'cjwbw/zoedepth': '6375723d97400d3ac7b88e3022b738bf6f433ae165c4a2acd1955eaa6b8fcb62',
}

async function createPrediction(
  modelVersion: string,
  input: any,
): Promise<Prediction> {
  // Call xinntao/gfpgan model; note that the required input field is 'img'
  const prediction = await replicate.predictions.create({
    version: modelVersion,
    input: input,
  });
  return await replicate.wait(prediction);
}

async function processImages({
  inputDir,
  outputDir,
  modelVersion,
  input,
}: {
  inputDir: string,
  outputDir: string,
  modelVersion: string,
  input: any,
}): Promise<void> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const files = fs.readdirSync(inputDir);
  
  for (const file of files) {
    if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
      try {
        // Check if file with same name in every extension already exists in outputDir
        const outputFilePaths = ['jpg', 'jpeg', 'png', 'webp'].map(ext => path.join(outputDir, file.replace(path.extname(file), `.${ext}`)));
        console.log('Checking if output file of ', file, ' exists');
        if (outputFilePaths.some(fs.existsSync)) {
          console.log(`File already processed: ${file}. Skipping prediction.`);
          continue;
        }
        // Construct Cloudflare URL from file name
        const fileUrl = `${cloudflareBaseUrl}/${file}`;
        console.log('Processing file', fileUrl);
        const predictionResponse = await createPrediction(modelVersion, {...input, image: fileUrl});
        // Check if the prediction response contains an output
        if (predictionResponse.output) {
          const outputExt = path.extname(predictionResponse.output);
          const outputFilePath = path.join(outputDir, file.replace(path.extname(file), outputExt));
          await downloadImage(predictionResponse.output, outputFilePath);
          console.log('downloaded output file', outputFilePath);
        } else if (predictionResponse.error) {
          // Log detailed error information from the prediction response
          console.error(`Prediction error for file ${file}: ${predictionResponse.error}`);
        } else {
          console.error(`Prediction output missing for file: ${file}`);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      } finally {
        console.log('--------------------------------');
      }
      // For debug; remove break if processing all files is needed.
      // break;
    }
  }
}

function downloadImage(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (Status Code: ${res.statusCode})`));
        return;
      }
      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded output image to ${outputPath}`);
        resolve();
      });
    }).on('error', (err: Error) => {
      reject(err);
    });
  });
}

// Example usage
const inputDir = 'public/images/rose';
/** upload images under inputDir to cloudflare r2, and set public access */
const cloudflareBaseUrl = process.env.CLOUDFLARE_BASE_URL! + "/rose";

const outputDir = 'public/images/rose-depth';
const scale = 1.5;

processImages({
  inputDir, 
  outputDir, 
  modelVersion: modelVersions['cjwbw/zoedepth'],
  input: { scale }
})
  .then(() => console.log('All images processed.'))
  .catch((err) => console.error('Error processing images:', err)); 