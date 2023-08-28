
const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


// Load image 

function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertError('Please');
    return;
  }

  // get image original dimension
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;

  }

  form.style.display = 'block';
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), 'imageresizer');

}

//send image data to main 
function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if (!img.files[0]) {
    alertError('please upload an image');
    return;
  }

  if (width === '' || height === '') {
    alertError('Please fill in the width and height');
    return;
  }


  // send to main using ipcRenderer
  ipcRenderer.send('image:resize', {
    imgPath,
    width,
    height,
  })
}

// catch image event
ipcRenderer.on('image:done', () => {
  alertSuccess(`image resized to ${widthInput.value} x ${heightInput.value}`)
})

// File is image
function isFileImage(file) {
  const acceptedImageType = ['image/gif', 'image/png', 'image/jpg', 'image/jpeg'];
  return file && acceptedImageType.includes(file['type']);
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center'

    }
  });
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center'

    }
  });
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);


