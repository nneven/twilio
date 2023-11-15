import { createWriteStream } from "node:fs";
import * as PlayHTAPI from "playht";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize PlayHTAPI
PlayHTAPI.init({
  apiKey: process.env.PLAYHT_API_KEY,
  userId: process.env.PLAYHT_USER_ID,
});

// Warm up the network caching
let warmupStream = await PlayHTAPI.stream("b", {
  voiceId:
    "s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json",
});

warmupStream.once("data", () => {
  const sentences = [process.argv[2]];

  const TTFBs = []; // Array to store TTFB for each sentence

  const streamAudio = async () => {
    const grpcFileStream = createWriteStream("translation.mp3", {
      flags: "a", // This ensures that each stream result is appended to the file
    });

    for (let [i, sentence] of sentences.entries()) {
      const startTime = Date.now(); // Start the timer

      const grpcStream = await PlayHTAPI.stream(sentence, {
        voiceId:
          "s3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json",
        outputFormat: "mp3", // 'mulaw'
        quality: "draft", // 'premium'
        speed: 1,
        textGuidance: 2.0,
      });

      let chunkCounter = 0;
      let firstChunkReceived = false;
      grpcStream.on("data", (chunk) => {
        chunkCounter += 1;
        if (chunkCounter === 2 && !firstChunkReceived) {
          const TTFB = Date.now() - startTime; // Calculate TTFB
          console.log(`TTFB for sentence ${i}: ${TTFB}ms`);
          TTFBs.push(TTFB); // Store the TTFB in the array
          firstChunkReceived = true;
        }
        grpcFileStream.write(chunk);
      });

      await new Promise((resolve, reject) => {
        grpcStream.on("end", resolve);
        grpcStream.on("error", reject);
      });
    }

    grpcFileStream.end();

    // Calculate average TTFB
    const avgTTFB = TTFBs.reduce((sum, value) => sum + value, 0) / TTFBs.length;

    // Calculate median TTFB
    const sortedTTFBs = [...TTFBs].sort((a, b) => a - b);
    const mid = Math.floor(sortedTTFBs.length / 2);
    const medianTTFB =
      sortedTTFBs.length % 2 === 0
        ? (sortedTTFBs[mid - 1] + sortedTTFBs[mid]) / 2
        : sortedTTFBs[mid];

    console.log(`Average TTFB: ${avgTTFB.toFixed(2)}ms`);
    console.log(`Median TTFB: ${medianTTFB}ms`);

    process.exit(0); // Exit the script
  };

  streamAudio().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
});
