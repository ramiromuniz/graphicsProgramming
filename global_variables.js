let capture;
let snapshot;
let takeSnapshotButton;
let useThisImageButton;
let takeNewOneButton;
let isSnapshotActive = false;
let snapshotUsed = false; // To check if the snapshot is being used in the grid


// Sliders for thresholding
let redThresholdSlider, greenThresholdSlider, blueThresholdSlider;

let hsvThresholdSlider; // Slider for the HSV threshold
let cmyThresholdSlider = hsvThresholdSlider; 

let faceApi;
let detections = []; // This will store the face detections
let faceLandmarks = []; // To store face landmarks

let currentFilterIndex = 0;

const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: false, // Adjust based on need
    minConfidence: 0.5
  };