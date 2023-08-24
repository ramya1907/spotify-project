import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';

// Specify the source and destination directories
const sourceDir = 'client/src/assets/images/bg-2.png';
const destinationDir = 'client/src/assets/comp_images';

(async () => {
  const files = await imagemin([`${sourceDir}`], {
    destination: destinationDir,
    plugins: [
      imageminPngquant({ quality: [0.6, 0.8] }) // Adjust quality as needed
    ]
  });

  console.log('Compressed images:', files);
})();
