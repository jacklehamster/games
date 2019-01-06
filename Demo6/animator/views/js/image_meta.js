const Meta = (function(document) {
  const META_TAG = "PNG";

  const emptyAnimation = { frames: [], frameRate: 60 };
  const spriteData = {};

  function getAnimationFrame(name, animationTag, now) {
    if (!spriteData[name]) return {};
    const spriteMetaData = spriteData[name].meta;
    const animationData = getAnimationData(spriteMetaData, animationTag) || emptyAnimation;
    const frame = ~~(now * animationData.frameRate / 1000);
    return animationData.frames[frame % animationData.frames.length] || {};
  }

  const cachedAnimationData = {};
  function getAnimationData(spriteMetaData, animationTag) {
    if (cachedAnimationData[spriteMetaData.id] && cachedAnimationData[spriteMetaData.id][animationTag]) {
      return cachedAnimationData[spriteMetaData.id][animationTag];
    }

    function findAnimationForFrame(f, animation, name, bigRect) {
      const canvasWidth = spriteMetaData.canvas.width;
      const canvasHeight = spriteMetaData.canvas.height;

      for (let i=0; i<spriteMetaData.frames.length; i++) {
        const frame = spriteMetaData.frames[i];
        const range = frame.range.split("-");
        const lowRange = range[0];
        const highRange = range.length>=2 ? range[1] : lowRange;
        if (lowRange <= f && f <= highRange) {
            const { crop, hotspot } = frame;
            return {
              frameId: md5(JSON.stringify([spriteMetaData.id , crop ])),
              crop,
              hotspot,
              scale: animation.scale,
              bigRect,
            };
        }
      }
      return {};
    }

    function findTag(rows, tag, defaultSelection) {
      for(let i=0; i<rows.length; i++) {
        if(rows[i].label===tag) {
          return i;
        }
      }
      return defaultSelection;
    }

    const rows = spriteMetaData.animation.rows;
    const selected = findTag(rows, animationTag, 0);
    const animation = rows[selected];

    const range = animation.range.split("-");
    const lowRange = parseInt(range[0]);
    const highRange = range.length>=2 ? parseInt(range[1]) : lowRange;
    if (isNaN(lowRange) || isNaN(highRange) || highRange < lowRange) {
      return {};
    }
    //  get dimension of a rectangle that can contain all animations
    const bigRect = { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    for(let i=0; i<spriteMetaData.frames.length; i++) {
      const { crop, hotspot } = spriteMetaData.frames[i];
      bigRect.minX = Math.min(bigRect.minX, -hotspot.x);
      bigRect.minY = Math.min(bigRect.minY, -hotspot.y);
      bigRect.maxX = Math.max(bigRect.maxX, crop.width-hotspot.x-1);
      bigRect.maxY = Math.max(bigRect.maxY, crop.height-hotspot.y-1);
    }
    bigRect.width = (bigRect.maxX - bigRect.minX) + 1;
    bigRect.height = (bigRect.maxY - bigRect.minY) + 1;

    const animationFrames = new Array(highRange - lowRange + 1);
    for(let i=0; i<animationFrames.length; i++) {
      const f = lowRange + i;
      const frame = findAnimationForFrame(f, animation, spriteMetaData.name, bigRect);
      animationFrames[i] = frame;
    }
//    console.log(spriteMetaData);
//    console.log(animationFrames);
    if (!cachedAnimationData[spriteMetaData.id]) {
      cachedAnimationData[spriteMetaData.id] = {};
    }

    return cachedAnimationData[spriteMetaData.id][animationTag] = {
      frameRate: animation.frameRate,
      frames: animationFrames,
    }
  }

  function getSpriteData(name) {
    return spriteData[name] || {};
  }

  function loadImage(src, callback) {
    const img = new Image();
    img.src = src;
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
      const meta = getMetaData(canvas);
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


  return {
    getAnimationFrame,
    getSpriteData,
    loadImage,
    removeImage,
    addImage,
    META_TAG,
  };
})(document);
