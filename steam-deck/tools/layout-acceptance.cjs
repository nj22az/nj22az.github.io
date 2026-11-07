// Axis-aligned DOM rectangles may be separated horizontally OR vertically.
// The shared quiet HUD centres the action pill below the caption; requiring
// caption.right < rail.left rejects that valid layout even when neither touches.
function rectanglesSeparated(a,b){
 return a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top;
}
module.exports={rectanglesSeparated};
