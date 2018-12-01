const Meta = (function(document) {
  const META_TAG = "PNG";

  const emptyAnimation = { frames: [], frameRate: 60 };
  const spriteData = {};

  function getAnimationFrame(name, animationTag, now) {
    if(!spriteData[name]) return null;
    const spriteMetaData = spriteData[name].meta;
    const animationData = getAnimationData(spriteMetaData, animationTag) || emptyAnimation;
    const frame = ~~(now * animationData.frameRate / 1000);
    return animationData.frames[frame % animationData.frames.length] || {};
  }

  const cachedAnimationData = {};
  function getAnimationData(spriteMetaData, animationTag) {
    const tag = spriteMetaData.id + "_" + animationTag;
    if (cachedAnimationData[tag]) {
      return cachedAnimationData[tag];
    }

    function findAnimationForFrame(f, animation, name) {
      const canvasWidth = spriteMetaData.canvas.width;
      const canvasHeight = spriteMetaData.canvas.height;

      for (let i=0; i<spriteMetaData.frames.length; i++) {
        const range = spriteMetaData.frames[i].range.split("-");
        const lowRange = range[0];
        const highRange = range.length>=2 ? range[1] : lowRange;
        if (lowRange <= f && f <= highRange) {
            const frame = spriteMetaData.frames[i];
            const left = frame.crop.x / canvasWidth;
            const right = (frame.crop.x + frame.crop.width-1) / canvasWidth;
            const top = frame.crop.y / canvasHeight;
            const bottom = (frame.crop.y + frame.crop.height-2) / canvasHeight;

            const posLeft   =    (-frame.hotspot.x);
            const posRight  =    (-frame.hotspot.x + frame.crop.width-1);
            const posTop    =   -(-frame.hotspot.y);
            const posBottom =   -(-frame.hotspot.y + frame.crop.height-2);

            const modelViewMatrix = mat4.create();

            const w = posRight - posLeft;
            const h = posTop - posBottom;
            const minSize = 1000;
            const hotspotFactor = minSize/2;
            mat4.scale(modelViewMatrix, modelViewMatrix, [animation.scale, animation.scale, 1]);
            mat4.translate(modelViewMatrix, modelViewMatrix, [posLeft/hotspotFactor, posTop/hotspotFactor, 0.0]);
            mat4.scale(modelViewMatrix, modelViewMatrix, [w/minSize, h/minSize, 1]);

            return {
              textureCoord: [
                left,   bottom,
                right,  bottom,
                right,  top,
                left,   top,
              ],
              crop: frame.crop,
              modelViewMatrix,
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
    const animationFrames = new Array(highRange - lowRange + 1);
    for(let i=0; i<animationFrames.length; i++) {
      const f = lowRange + i;
      const frame = findAnimationForFrame(f, animation, spriteMetaData.name);
      animationFrames[i] = frame;
    }

    return cachedAnimationData[spriteMetaData.id] = {
      spriteId: spriteMetaData.id,
      frameRate: animation.frameRate,
      frames: animationFrames,
      time: new Date().getTime(),
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
        data.data[4] * 255 * 255 +
        data.data[5] * 255 +
        data.data[6];

      const metaHeight = 
        data.data[8] * 255 * 255 +
        data.data[9] * 255 +
        data.data[10];
      const totalMeta = canvas.getContext('2d').getImageData(0, canvas.height - metaHeight, canvas.width, metaHeight);

      const formattedMeta = new Uint8Array(metaDataSize);
      let pos = 0, pos2 = 0;
      while(pos < formattedMeta.length) {
        formattedMeta[pos] = totalMeta.data[pos2];
        pos++;
        pos2++;
        if(pos2%4===3) pos2++;
      }
      if(!window.pako || !pako.inflate) {
        console.err("pako.min.js missing.");
        return null;
      }
      return JSON.parse(pako.inflate(formattedMeta, { to: 'string' }));
    } catch(e) {
      console.err(e);
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
