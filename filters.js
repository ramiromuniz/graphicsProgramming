const filters = [
    (img) => img, // Original image, no filter applied
    convertToGreyscale, // Greyscale filter
    (img) => applyBlurToImage(img, 10), // Blur filter
    convertToCmy, // CMYK conversion filter
    pixelateImage, // Pixelation filter
    drawEmotionAndLandmarks, // Emotion detection and landmark drawing
  ];

// Function to convert an image to grayscale and increase brightness by 20%
function convertToGrayscaleAndIncreaseBrightness(img) {
    let newImg = img.get(); // copy of the image to manipulate
    newImg.loadPixels();
    
    for (let y = 0; y < newImg.height; y++) {
      for (let x = 0; x < newImg.width; x++) {
        let index = (x + y * newImg.width) * 4;
        let r = newImg.pixels[index];
        let g = newImg.pixels[index + 1];
        let b = newImg.pixels[index + 2];
        let avg = (r + g + b) / 3; // Convert to grayscale
        avg = avg * 1.2; // Increase brightness by 20%
        avg = avg > 255 ? 255 : avg; // Ensure we don't exceed the max value
        newImg.pixels[index] = avg;
        newImg.pixels[index + 1] = avg;
        newImg.pixels[index + 2] = avg;
      }
    }
    
    newImg.updatePixels();
    return newImg;
  }
  
function extractRedChannel(img) {
    let redChannel = img.get();
    redChannel.loadPixels();
    for (let i = 0; i < redChannel.pixels.length; i += 4) {
      redChannel.pixels[i + 1] = 0; // Green component set to 0
      redChannel.pixels[i + 2] = 0; // Blue component set to 0
    }
    redChannel.updatePixels();
    return redChannel;
}
  
function extractGreenChannel(img) {
    let greenChannel = img.get();
    greenChannel.loadPixels();
    for (let i = 0; i < greenChannel.pixels.length; i += 4) {
      greenChannel.pixels[i] = 0; // Red component set to 0
      greenChannel.pixels[i + 2] = 0; // Blue component set to 0
    }
    greenChannel.updatePixels();
    return greenChannel;
}
  
function extractBlueChannel(img) {
    let blueChannel = img.get();
    blueChannel.loadPixels();
    for (let i = 0; i < blueChannel.pixels.length; i += 4) {
      blueChannel.pixels[i] = 0; // Red component set to 0
      blueChannel.pixels[i + 1] = 0; // Green component set to 0
    }
    blueChannel.updatePixels();
    return blueChannel;
}
  
  // Function to apply threshold based on a slider value
function applyThreshold(channelImage, channelIndex, thresholdSlider) {
    let thresholdedImage = channelImage.get(); 
    let thresholdValue = thresholdSlider.value(); 
    thresholdedImage.loadPixels();
    for (let i = 0; i < thresholdedImage.pixels.length; i += 4) {
      // Apply threshold to the specific channel
      thresholdedImage.pixels[i + channelIndex] = thresholdedImage.pixels[i + channelIndex] > thresholdValue ? 255 : 0;
      // Set the other two channels to 0
      if (channelIndex != 0) thresholdedImage.pixels[i] = 0; // Red channel
      if (channelIndex != 1) thresholdedImage.pixels[i + 1] = 0; // Green channel
      if (channelIndex != 2) thresholdedImage.pixels[i + 2] = 0; // Blue channel
    }
    thresholdedImage.updatePixels();
    return thresholdedImage;
}
  
function updateThresholdImages() {
  
    if (snapshotUsed) {
      // Extract channels from the snapshot
      let redImage = extractRedChannel(snapshot);
      let greenImage = extractGreenChannel(snapshot);
      let blueImage = extractBlueChannel(snapshot);
  
      // Apply the threshold to each channel image using the slider objects
      redChannelThresholded = applyThreshold(redImage, 0, redThresholdSlider);
      greenChannelThresholded = applyThreshold(greenImage, 1, greenThresholdSlider);
      blueChannelThresholded = applyThreshold(blueImage, 2, blueThresholdSlider);
  
      // Trigger a redraw of the grid to display the updated images
      displayGrid();
    }
}
  
// Convert RGB color space to HSV color space
function rgbToHsv(r, g, b) {
  // Normalize RGB values to the [0, 1] range
  r /= 255, g /= 255, b /= 255;
  
  // Calculate the max and min values of R, G, and B
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  
  let h, s, v = max;
  
  // Calculate the difference between the max and min RGB values
  let d = max - min;
  
  // Calculate saturation; saturation is zero if max is zero (avoid division by zero)
  s = max == 0 ? 0 : d / max;

  // Calculate hue
  if (max == min) {
    // If max and min are equal, hue is zero (achromatic)
    h = 0;
  } else {
    // Calculate hue based on which RGB component is the max
    // Also adjust the hue based on the sector of the color wheel the color is in
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break; // Between yellow & magenta
      case g: h = (b - r) / d + 2; break; // Between cyan & yellow
      case b: h = (r - g) / d + 4; break; // Between magenta & cyan
    }
    // Normalize the hue to the [0, 1] range
    h /= 6;
  }

  // Return the HSV values as an array
  return [h, s, v];
}
  
  
// This function converts an RGB image to HSV color space and displays it on the canvas.
function displayHsvConversion(x, y, img) {
  let hsvImage = img.get();
  hsvImage.loadPixels();

  // Loop through every pixel in the image
  for (let i = 0; i < hsvImage.pixels.length; i += 4) {
    // Extract the RGB values of the current pixel
    let r = hsvImage.pixels[i];
    let g = hsvImage.pixels[i + 1];
    let b = hsvImage.pixels[i + 2];
    // Convert RGB to HSV
    let hsv = rgbToHsv(r, g, b);
    // Remap the HSV values back to RGB color space and assign them to the pixel
    hsvImage.pixels[i] = hsv[0] * 255;  // Hue mapped to Red
    hsvImage.pixels[i + 1] = hsv[1] * 255; // Saturation mapped to Green
    hsvImage.pixels[i + 2] = hsv[2] * 255; // Value mapped to Blue
  }

  hsvImage.updatePixels();
  image(hsvImage, x, y, 160, 120);
}

// This function converts an image from RGB to HSV color space and returns the converted image.
function convertToHsv(img) {
  let hsvImage = img.get();
  hsvImage.loadPixels();

  // Iterate through each pixel in the image
  for (let i = 0; i < hsvImage.pixels.length; i += 4) {
    // Extract RGB values of the current pixel
    let r = hsvImage.pixels[i];
    let g = hsvImage.pixels[i + 1];
    let b = hsvImage.pixels[i + 2];
    // Convert the RGB values to HSV
    let hsv = rgbToHsv(r, g, b);
    // Remap the HSV values to RGB color space for visualization
    hsvImage.pixels[i] = hsv[0] * 255; // Hue mapped to Red
    hsvImage.pixels[i + 1] = hsv[1] * 255; // Saturation mapped to Green
    hsvImage.pixels[i + 2] = hsv[2] * 255; // Value mapped to Blue
  }

  hsvImage.updatePixels();
  return hsvImage;
}

// This function converts RGB values to CMY (Cyan, Magenta, Yellow) values.
function rgbToCmy(r, g, b) {
  // Convert RGB to CMY by subtracting each component from 255 and normalizing
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);
  return [c, m, y]; // Return the CMY values as an array
}

// This function converts an RGB image to CMY color space and displays it on the canvas.
function displayCmyConversion(x, y, img) {
  let cmyImage = img.get();
  cmyImage.loadPixels();

  // Loop through every pixel in the image
  for (let i = 0; i < cmyImage.pixels.length; i += 4) {
    // Extract the RGB values of the current pixel
    let r = cmyImage.pixels[i];
    let g = cmyImage.pixels[i + 1];
    let b = cmyImage.pixels[i + 2];
    // Convert RGB to CMY
    let cmy = rgbToCmy(r, g, b);
    // Map CMY values back to RGB color space for display (Cyan to Red, Magenta to Green, Yellow to Blue)
    cmyImage.pixels[i] = cmy[0] * 255;
    cmyImage.pixels[i + 1] = cmy[1] * 255;
    cmyImage.pixels[i + 2] = cmy[2] * 255;
  }

  cmyImage.updatePixels();
  image(cmyImage, x, y, 160, 120);
}

// This function converts an image from RGB to CMY color space and returns the converted image.
function convertToCmy(img) {
  let cmyImage = img.get();
  cmyImage.loadPixels();

  // Iterate through each pixel in the image
  for (let i = 0; i < cmyImage.pixels.length; i += 4) {
    // Extract RGB values of the current pixel
    let r = cmyImage.pixels[i];
    let g = cmyImage.pixels[i + 1];
    let b = cmyImage.pixels[i + 2];
    // Convert the RGB values to CMY
    let cmy = rgbToCmy(r, g, b);
    // Remap the CMY values to RGB color space for visualization
    cmyImage.pixels[i] = cmy[0] * 255; // Cyan mapped to Red
    cmyImage.pixels[i + 1] = cmy[1] * 255; // Magenta mapped to Green
    cmyImage.pixels[i + 2] = cmy[2] * 255; // Yellow mapped to Blue
  }

  cmyImage.updatePixels();
  return cmyImage;
}
  
// Applies a threshold filter to an image that has been converted to another color space, using a slider to determine the threshold value.
function applyThresholdToColorConverted(img, thresholdSlider) {
  let thresholdedImage = img.get();
  let thresholdValue = thresholdSlider.value();
  thresholdedImage.loadPixels();
  
  // Iterate through each pixel in the image.
  for (let i = 0; i < thresholdedImage.pixels.length; i += 4) {
    // Calculate the average intensity of the current pixel (grayscale equivalent).
    let intensity = (thresholdedImage.pixels[i] + thresholdedImage.pixels[i + 1] + thresholdedImage.pixels[i + 2]) / 3;
    // Apply the threshold: set pixel to white if above threshold, black otherwise.
    let newValue = intensity > thresholdValue ? 255 : 0;
    thresholdedImage.pixels[i] = newValue; // Update the red component.
    thresholdedImage.pixels[i + 1] = newValue; // Update the green component.
    thresholdedImage.pixels[i + 2] = newValue; // Update the blue component.
  }
  
  thresholdedImage.updatePixels();
  return thresholdedImage;
}

function updateThresholdImages() {
  // Check if a snapshot has been taken and used.
  if (snapshotUsed) {
    displayGrid();
  }
}