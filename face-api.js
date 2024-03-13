// Callback function when the Face API model is successfully loaded.
function modelReady() {
  console.log('Face API Model Ready');
  faceApi.detect(gotFaces); // Start the face detection process.
}

// Function to handle the face detection results.
function gotFaces(error, results) {
  if (error) {
    console.error(error); // Log any errors to the console.
    return;
  }
  detections = results; // Update the global variable with the latest detection results.
  faceApi.detect(gotFaces); // Continue detecting faces in a loop.
}
  
    // Convert live feed to greyscale
function convertToGreyscale(img) {
    let newImg = img.get();
    newImg.loadPixels();
    for (let i = 0; i < newImg.pixels.length; i += 4) {
      let avg = (newImg.pixels[i] + newImg.pixels[i + 1] + newImg.pixels[i + 2]) / 3;
      newImg.pixels[i] = avg;
      newImg.pixels[i + 1] = avg;
      newImg.pixels[i + 2] = avg;
    }
    newImg.updatePixels();
    return newImg;
  }
  // Function to blur image
function applyBlurToImage(img, blurLevel) {
    let graphics = createGraphics(img.width, img.height);
    // Draw the face image onto the graphics object
    graphics.image(img, 0, 0);
    // Apply the blur effect
    graphics.filter(BLUR, blurLevel);
    
    return graphics;
  }
  
function keyPressed() {
    // If 'g' key is pressed
    if (key === 'g'|| key ===  'G') {
      // Change index to match the filter
      currentFilterIndex = (currentFilterIndex + 1) % filters.length;
    }
}
  
  // Calculates the average brightness for a block of pixels in the image.
function calculateBlockAverage(img, xStart, yStart, blockSize) {
  let total = 0; // Sum of brightness values.
  let count = 0; // Number of pixels processed.

  // Iterate through each pixel in the block.
  for (let x = xStart; x < xStart + blockSize && x < img.width; x++) {
      for (let y = yStart; y < yStart + blockSize && y < img.height; y++) {
          let c = img.get(x, y); // Get the color of the pixel.
          let brightness = (red(c) + green(c) + blue(c)) / 3; // Calculate its brightness.
          total += brightness; // Add to the total brightness.
          count++; // Increment the pixel count.
      }
  }

  let averageIntensity = total / count; // Calculate the average brightness.
  return color(averageIntensity); // Return this as a p5 color.
}

// Applies a pixelation effect to an image
function pixelateImage(img, pixelSize) {
  let sourceImg = img.get();
  sourceImg.loadPixels();

  // Create a new graphics object to draw the pixelated version.
  let pg = createGraphics(sourceImg.width, sourceImg.height);
  pg.pixelDensity(1); // Ensure consistent pixel density.

  // Loop over the image in steps of 'pixelSize' to process each block.
  for (let y = 0; y < sourceImg.height; y += pixelSize) {
      for (let x = 0; x < sourceImg.width; x += pixelSize) {
          let avgColor = calculateBlockAverage(sourceImg, x, y, pixelSize); // Calculate block's average color.
          pg.fill(avgColor); // Use this color to fill.
          pg.noStroke(); // No border for the rectangles.
          pg.rect(x, y, pixelSize, pixelSize); // Draw a rectangle representing the pixelated block.
      }
  }

  return pg; // Return the graphics object containing the pixelated image.
}

// Draws facial landmarks and expressions detected in a face.
function drawEmotionAndLandmarks(detection, x, y, width, height, scaleFactorX, scaleFactorY) {
  drawLandmarks(detection, x, y, scaleFactorX, scaleFactorY); 
  drawExpressions(detection, x, y + height + 20);
}

// Draws facial landmarks at scaled positions based on detection.
function drawLandmarks(detection, x, y, scaleFactorX, scaleFactorY) {
  const points = detection.landmarks.positions; // Extract landmark positions.
  push(); 
  stroke(44, 169, 225); // Set color for landmarks.
  strokeWeight(2); // Set thickness of the landmark points.

  // Iterate through each landmark point and draw it at the adjusted position.
  points.forEach(p => {
      const adjustedX = x + (p._x - detection.alignedRect._box._x) * scaleFactorX; 
      const adjustedY = y + (p._y - detection.alignedRect._box._y) * scaleFactorY;
      point(adjustedX, adjustedY);
  });
  pop();
}

// Displays the detected expressions next to the detected face.
function drawExpressions(detection, x, y) {
  const expressions = detection.expressions; // Extract facial expressions.
  const keys = Object.keys(expressions); // Get expression names.

  // Iterate through each expression and display its name and value.
  keys.forEach((key, index) => {
      const value = nf(expressions[key] * 100, 2, 2) + "%"; // Format expression value.
      text(`${key}: ${value}`, x, y + index * 20); // Display expression name and value.
  });
}