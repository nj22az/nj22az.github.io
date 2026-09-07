// Johansson Town first-person presentation layer.
// The underlying game retains its four camera modes for accessibility/debugging,
// but normal play now starts from Johansson's eye level.

const cameraButton=document.querySelector('#cameraButton');
const canvas=document.querySelector('#game');
const modes=['FOLLOW','WIDE','CLOSE','FIRST'];
let mode=0;

function updateCameraLabel(){
  if(!cameraButton)return;
  cameraButton.textContent=`CAMERA · ${modes[mode]}`;
  cameraButton.dataset.cameraMode=modes[mode].toLowerCase();
  document.documentElement.dataset.cameraMode=modes[mode].toLowerCase();
  window.__JOHANSSON_CAMERA_MODE__=modes[mode].toLowerCase();
}

function enterFirstPerson(){
  if(!cameraButton)return false;
  // main.js starts in FOLLOW (index 0). Use the game's own camera control rather
  // than reaching into private Three.js state: FOLLOW -> WIDE -> CLOSE -> FIRST.
  for(let i=0;i<3;i++)cameraButton.click();
  mode=3;
  updateCameraLabel();
  return true;
}

if(cameraButton){
  enterFirstPerson();

  // Keep the other views available through CAMERA / V. This also keeps the label
  // truthful when WebMCP presses the same visible control.
  cameraButton.addEventListener('click',()=>{
    mode=(mode+1)%4;
    queueMicrotask(updateCameraLabel);
  });
}

// Desktop first-person feels best with pointer-lock mouse look. We do not request
// pointer lock automatically because browsers require a user gesture; a canvas tap
// already invokes the game's existing pointer-lock path.
canvas?.setAttribute('aria-description','First-person exploration view. Tap or click the scene to look around; use the movement controls to walk.');
window.__JOHANSSON_FIRST_PERSON_DEFAULT__=true;
