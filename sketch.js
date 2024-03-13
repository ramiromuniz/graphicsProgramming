function setup() {
  createCanvas(560, 1120); // Adjusted width as per your instructions
  capture = createCapture(VIDEO);
  capture.size(320, 240); // Set the size of the webcam capture
  capture.hide();

  // Initialize the face detection model
  const options = {
    withLandmarks: true,
    withDescriptors: false,
  };
  faceApi = ml5.faceApi(capture, options, modelReady);

  // Button to take a snapshot
  takeSnapshotButton = createButton('Take Snapshot');
  takeSnapshotButton.position(19, 19);
  takeSnapshotButton.mousePressed(takeSnapshot);

  // Button to use the snapshot
  useThisImageButton = createButton('Use This Image');
  useThisImageButton.position(19, 49); // Positioned below the take snapshot button
  useThisImageButton.mousePressed(useSnapshot);
  useThisImageButton.hide(); // Initially hide this button

  // Button to retake snapshot
  takeNewOneButton = createButton('Take New One');
  takeNewOneButton.position(19, 79); // Positioned below the use this image button
  takeNewOneButton.mousePressed(retakeSnapshot);
  takeNewOneButton.hide(); // Initially hide this button

  // Create sliders for thresholding each color channel
  redThresholdSlider = createSlider(0, 255, 128); // Start in the middle
  greenThresholdSlider = createSlider(0, 255, 128); // Start in the middle
  blueThresholdSlider = createSlider(0, 255, 128); // Start in the middle

  // Register the slider input events
  redThresholdSlider.input(updateThresholdImages);
  greenThresholdSlider.input(updateThresholdImages);
  blueThresholdSlider.input(updateThresholdImages);

  // Create a slider for the HSV threshold
  hsvThresholdSlider = createSlider(0, 255, 128); // Start in the middle
  hsvThresholdSlider.input(updateThresholdImages); // Register the slider input event

  cmyThresholdSlider = createSlider(0, 255, 128); // Start in the middle
  cmyThresholdSlider.input(updateThresholdImages); // Register the slider input event

  // Hide the sliders initially
  redThresholdSlider.hide();
  greenThresholdSlider.hide();
  blueThresholdSlider.hide();
  hsvThresholdSlider.hide();
  cmyThresholdSlider.hide();
}

function draw() {
  // Clear the canvas
  clear();
  
  if (snapshotUsed) {
    displayGrid(); // Display the grid with the live feed and processed images
  } else {

    // Display the live feed or the snapshot in full size
    let aspectRatio = capture.width / capture.height;
    let displayHeight = width / aspectRatio;
    if (isSnapshotActive) {
      image(snapshot, 50, 50, width, displayHeight);
    } else {
      image(capture, 50, 50, width, displayHeight);
    }
  }
}

function displayGrid() {

  // Clear the canvas
  clear();
  // Hide the sliders initially
  redThresholdSlider.show();
  greenThresholdSlider.show();
  blueThresholdSlider.show();
  hsvThresholdSlider.show();
  cmyThresholdSlider.show();

  // Define padding and positions
  let padding = 20;
  let x = padding;
  let y = padding;
  let labelOffset = 7; // Offset for the label text above the image

  // Display labels and images
  text('Webcam Image', x, y - labelOffset);
  image(snapshot, x, y, 160, 120);

  text('Grayscale and Brightness +20%', x + (160 + padding), y - labelOffset);
  let grayscaleImage = convertToGrayscaleAndIncreaseBrightness(snapshot);
  image(grayscaleImage, x + (160 + padding), y, 160, 120);

  let ySecondRow = y + (120 + padding);
  text('Red Channel', x, ySecondRow - labelOffset);
  let redImage = extractRedChannel(snapshot);
  image(redImage, x, ySecondRow, 160, 120);

  text('Green Channel', x + (160 + padding), ySecondRow - labelOffset);
  let greenImage = extractGreenChannel(snapshot);
  image(greenImage, x + (160 + padding), ySecondRow, 160, 120);

  text('Blue Channel', x + 2 * (160 + padding), ySecondRow - labelOffset);
  let blueImage = extractBlueChannel(snapshot);
  image(blueImage, x + 2 * (160 + padding), ySecondRow, 160, 120);


  let yThirdRow = ySecondRow + (120 + padding);
  text('Red Threshold', x, yThirdRow - labelOffset);
  let redChannelThresholded = applyThreshold(redImage, 0, redThresholdSlider); // Add the channel index
  image(redChannelThresholded, x, yThirdRow, 160, 120);
  redThresholdSlider.position(x, yThirdRow + 125);

  text('Green Threshold', x + (160 + padding), yThirdRow - labelOffset);
  let greenChannelThresholded = applyThreshold(greenImage, 1, greenThresholdSlider); // Add the channel index
  image(greenChannelThresholded, x + (160 + padding), yThirdRow, 160, 120);
  greenThresholdSlider.position(x + (160 + padding), yThirdRow + 125);

  text('Blue Threshold', x + 2 * (160 + padding), yThirdRow - labelOffset);
  let blueChannelThresholded = applyThreshold(blueImage, 2, blueThresholdSlider); // Add the channel index
  image(blueChannelThresholded, x + 2 * (160 + padding), yThirdRow, 160, 120);
  blueThresholdSlider.position(x + 2 * (160 + padding), yThirdRow + 125);

  let yFourthRow = yThirdRow+20 + (120 + padding);
  text('Webcam Image', x, yFourthRow - labelOffset);
  image(snapshot, x, yFourthRow, 160, 120);

  text('RGB to HSV', x + (160 + padding), yFourthRow - labelOffset);
  displayHsvConversion(x + (160 + padding), yFourthRow, snapshot);

  text('RGB to CMY', x + 2 * (160 + padding), yFourthRow - labelOffset);
  displayCmyConversion(x + 2 * (160 + padding), yFourthRow, snapshot);

  // Face detection
  let captureImg = capture.get();
  let yFifthRow = yFourthRow + (120 + padding);
  text('Face Detection', x, yFifthRow - labelOffset);

  // Get the scale factor if the image is resized
  let scaleFactorX = 160 / capture.width;
  let scaleFactorY = 120 / capture.height;
  image(captureImg, x, yFifthRow, 160, 120);

  detections.forEach(detection => {
    let { _x, _y, _width, _height } = detection.alignedRect._box;
  
    // Scale the detected face coordinates and dimensions
    let scaledX = _x * scaleFactorX + x; // Adjust starting x with padding
    let scaledY = _y * scaleFactorY + yFifthRow; // Adjust starting y based on row
    let scaledWidth = _width * scaleFactorX;
    let scaledHeight = _height * scaleFactorY;
  
    if (currentFilterIndex === 0) {
      // No filter - draw rectangle around the face
      push();
      noFill();
      stroke(0, 255, 0); // Green color for the rectangle outline
      strokeWeight(0.5);
      rect(scaledX, scaledY, scaledWidth, scaledHeight);
      pop();
    } else {
      // Extract the scaled face area from the live feed
      let faceArea = capture.get(_x, _y, _width, _height);
  
      // Apply the current filter and draw
      let filteredFace;
      switch(currentFilterIndex) {
        case 1: // Greyscale
          filteredFace = convertToGreyscale(faceArea);
          break;
        case 2: // Blur
          filteredFace = applyBlurToImage(faceArea, 10);
          break;
        case 3: // CMY
          filteredFace = convertToCmy(faceArea);
          break;
        case 4:
          filteredFace = pixelateImage(faceArea, 5); // Corrected call
          break;
        case 5:
          let startX = x + detection.alignedRect._box._x * scaleFactorX;
          let startY = yFifthRow + detection.alignedRect._box._y * scaleFactorY;
          let faceWidth = detection.alignedRect._box._width * scaleFactorX;
          let faceHeight = detection.alignedRect._box._height * scaleFactorY;
          
          drawEmotionAndLandmarks(detection, startX, startY, faceWidth, faceHeight, scaleFactorX, scaleFactorY);
          break;
        default:
          console.error("Invalid filter index");
          break;
        }
  
      // Ensure filteredFace is not undefined before attempting to draw it
      if (filteredFace) {
        image(filteredFace, scaledX, scaledY, scaledWidth, scaledHeight);
      }
    }
  });
  
  // Display the HSV thresholded image
  text('HSV Threshold', x + (160 + padding), yFifthRow - labelOffset);
  let hsvImage = convertToHsv(snapshot); // First, convert the snapshot to HSV
  let hsvThresholded = applyThresholdToColorConverted(hsvImage, hsvThresholdSlider); // Apply threshold to HSV image
  image(hsvThresholded, x + (160 + padding), yFifthRow, 160, 120); // Display it
  hsvThresholdSlider.position(x + (160 + padding), yFifthRow + 125); // Position the slider

  // Display the CMY thresholded image
  text('CMY Threshold', x + 2 * (160 + padding), yFifthRow - labelOffset);
  let cmyImage = convertToCmy(snapshot); // Convert the snapshot to CMY
  let cmyThresholded = applyThresholdToColorConverted(cmyImage, cmyThresholdSlider); // Apply threshold to CMY image
  image(cmyThresholded, x + 2 * (160 + padding), yFifthRow, 160, 120); // Display it
  cmyThresholdSlider.position(x + 2 * (160 + padding), yFifthRow + 125);

  let ySixthRow = yFifthRow + (120 + padding); // Calculate the y position of the sixth row.
  push();
  textSize(16);
  fill(0); // White color for the text for better visibility
  noStroke();
  text('Press G to change facial detection filters', x, ySixthRow+20);
  pop();
}


