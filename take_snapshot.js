// Function to handle snapshot
function takeSnapshot() {
    snapshot = capture.get();
    isSnapshotActive = true;
    takeSnapshotButton.hide(); // Hide the 'Take Snapshot' button
    useThisImageButton.show();
    takeNewOneButton.show();
  }
  
  // Function to use the taken snapshot
  function useSnapshot() {
    isSnapshotActive = false;
    snapshotUsed = true; // Now we're using the snapshot in the grid
  
    // Hide the buttons
    takeSnapshotButton.hide();
    useThisImageButton.hide();
    takeNewOneButton.hide();
  }
  
  // Function to retake the snapshot
  function retakeSnapshot() {
    capture.remove(); // Remove the existing capture
    capture = createCapture(VIDEO); // Create a new capture
    capture.size(320, 240);
    capture.hide();
  
    snapshot = null;
    isSnapshotActive = false;
    snapshotUsed = false;
  
    takeSnapshotButton.show();
    useThisImageButton.hide();
    takeNewOneButton.hide();
  }