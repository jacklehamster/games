const Meta = (function(document) {
  const META_TAG = "PNG";

  const spriteData = {};
  const EMPTY = {};

  function singleFrameMeta(name, canvas) {
    const { minX, minY, maxX, maxY } = Utils.getCrop(canvas);
    return {
      name,
      canvas: {
        width: canvas.width,
        height: canvas.height,
      },
      animation: {
        rows: [
          {
            label: 'default',
            range: '0-0',
            frameRate: 60,
            scale: 1,
            locked: true,
          }
        ],
      },
      frames: [
        {
          range: "0-0",
          hotspot: {
            x: (minX + maxX) / 2,
            y: maxY,
          },
          crop: {
            x: minX,
            y: minY,
            width: (maxX - minX) + 1,
            height: (maxY - minY) + 1,
          },
        }
      ],
    };
  }

  function getSpriteData(name) {
    return spriteData[name] || EMPTY;
  }

  function loadImage(src, callback) {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "";
    img.addEventListener('load', e => {
      const img = e.currentTarget;
      const { canvas, meta } = addImage(img);
      callback(img, meta);
    });
  }

  function addImage(img) {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      let meta = getMetaData(canvas);
      if(!meta) {
        meta = singleFrameMeta(img.src.split('/').pop().split(".")[0], canvas);
      }
      spriteData[meta.name] = {
        meta,
        canvas,
      };
      return spriteData[meta.name];
  }

  function removeImage(name) {
    delete spriteData[name];
  }

  function format4to3(data, size) {
      const formattedData = new Uint8Array(size);
      let pos = 0, pos2 = 0;
      while(pos < formattedData.length) {
        formattedData[pos] = data[pos2];
        pos++;
        pos2++;
        if(pos2%4===3) pos2++;
      }
      return formattedData;
  }

  function getMetaData(canvas) {
    const data = canvas.getContext('2d').getImageData(canvas.width-3, canvas.height-1, 3, 1);
    const metaTag = [
      String.fromCharCode(data.data[0]),
      String.fromCharCode(data.data[1]),
      String.fromCharCode(data.data[2]),
    ].join("");

    if(metaTag != Meta.META_TAG) {
      return null;
    }

    try {
      const metaDataSize = 
        data.data[4] * 256 * 256 +
        data.data[5] * 256 +
        data.data[6];

      const metaHeight = 
        data.data[8] * 256 * 256 +
        data.data[9] * 256 +
        data.data[10];

      const totalMeta = canvas.getContext('2d').getImageData(0, canvas.height - metaHeight, canvas.width, metaHeight);
      const formattedMeta = format4to3(totalMeta.data, metaDataSize);

      if(!window.pako || !pako.inflate) {
        console.error("pako.min.js missing.");
        return null;
      }
      return JSON.parse(pako.inflate(formattedMeta, { to: 'string' }));
    } catch(e) {
      console.error(e);
    }
    return null;
  };

  function drawMeta(meta, canvas) {
    const json = JSON.stringify(meta);
    const uint8array = pako.deflate(JSON.stringify(meta), { to: 'blob' });

    const extraMargin = 1;
    const extraBufferSize = 9;
    const uint8clamped = new Uint8ClampedArray(
      Math.ceil((uint8array.length + extraBufferSize) / (meta.canvas.width*3)) * meta.canvas.width*3
    );

    const extraHeight = Math.ceil(uint8clamped.length / 3 / meta.canvas.width);
    const extra = [
      Meta.META_TAG.charCodeAt(0),
      Meta.META_TAG.charCodeAt(1),
      Meta.META_TAG.charCodeAt(2),
      Math.floor(uint8array.length / (255 * 255)) % 255,
      Math.floor(uint8array.length / 255) % 255,
      uint8array.length % 255,
      Math.floor(extraHeight / (255 * 255)) % 255,
      Math.floor(extraHeight / 255) % 255,
      extraHeight % 255,
    ];
    uint8clamped.fill(255);
    uint8clamped.set(uint8array);
    uint8clamped.set(extra, uint8clamped.length-extra.length);

    const expandedClamped = new Uint8ClampedArray(uint8clamped.length / 3 * 4);
    for(let i = 0; i < uint8clamped.length / 3; i++) {
        expandedClamped[i * 4] = uint8clamped[i * 3];
        expandedClamped[i * 4 + 1] = uint8clamped[i * 3 + 1];
        expandedClamped[i * 4 + 2] = uint8clamped[i * 3 + 2];
        expandedClamped[i * 4 + 3] = 255;
    }

    const tempData = canvas.getContext('2d').getImageData(0, 0, meta.canvas.width, meta.canvas.height);

    const extraImgData = new ImageData(expandedClamped, meta.canvas.width);
    canvas.height = meta.canvas.height + extraHeight + extraMargin;
    canvas.getContext('2d').putImageData(tempData, 0, 0);
    canvas.getContext('2d').putImageData(extraImgData, 0, meta.canvas.height + extraMargin);
  }  

  return {
    getSpriteData,
    loadImage,
    removeImage,
    addImage,
    drawMeta,
    META_TAG,
  };
})(document);
