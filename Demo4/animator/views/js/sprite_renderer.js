const SpriteRenderer = (function() {

	const vsSource = `
		attribute vec4 aVertexPosition;
		attribute vec2 aTextureCoord;
		uniform mat4 uModelViewMatrix;
		uniform mat4 uTransformMatrix;
		uniform mat4 uProjectionMatrix;
		varying highp vec2 vTextureCoord;
		void main(void) {
		  gl_Position = uProjectionMatrix * uTransformMatrix * uModelViewMatrix * aVertexPosition;
		  vTextureCoord = aTextureCoord;
		}
	`;

	const fsSource = `
		varying highp vec2 vTextureCoord;
		uniform sampler2D uSampler;
		void main(void) {
		  gl_FragColor = texture2D(uSampler, vTextureCoord);
		}
	`;

	function Renderer(gl) {
		if(!TextureFactory) {
			console.error("texture_meta.js missing.");
		}

		this.gl = gl;
		const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
		gl.useProgram(shaderProgram);
		this.programInfo = {
	      vertexLocation: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
	      textureLocation: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
	      projectionLocation: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
	      transformLocation: gl.getUniformLocation(shaderProgram, 'uTransformMatrix'),
	      modelViewLocation: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
	      uSamplerLocation: gl.getUniformLocation(shaderProgram, 'uSampler'),
		};
	}

	Renderer.prototype.clearScene = function() {
		const gl = this.gl;
		gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
		gl.clearDepth(1.0);                 // Clear everything
		gl.enable(gl.DEPTH_TEST);           // Enable depth testing
		gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		const fieldOfView = 45 * Math.PI / 180;   // in radians
		const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		const zNear = 0.1;
		const zFar = 100.0;
		const projectionMatrix = mat4.create();
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
		gl.uniformMatrix4fv(this.programInfo.projectionLocation, false, projectionMatrix);
	}


	Renderer.prototype.drawScene = function(name, label, now, x, y) {
		const gl = this.gl;
		const textureFactory = gl.getTextureFactory();
		const frame = textureFactory.getFrame(name, label, now);
		if(!frame.texture) {
			return;
		}
		const programInfo = this.programInfo;

		{
			gl.bindBuffer(gl.ARRAY_BUFFER, textureFactory.positionBuffer);

			const numComponents = 3;
			const type = gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			gl.vertexAttribPointer(programInfo.vertexLocation,
			    numComponents,
			    type,
			    normalize,
			    stride,
			    offset);
			gl.enableVertexAttribArray(programInfo.vertexLocation);
		}

		{
			const numComponents = 2;
			const type = gl.FLOAT;
			const normalize = false;
			const stride = 0;
			const offset = 0;
			gl.bindBuffer(gl.ARRAY_BUFFER, frame.texture.coordinateBuffer);
			gl.vertexAttribPointer(programInfo.textureLocation,
			    numComponents,
			    type,
			    normalize,
			    stride,
			    offset);
			gl.enableVertexAttribArray(programInfo.textureLocation);
		}

		const modelViewMatrix = frame.modelViewMatrix;

		const transformMatrix = mat4.create();
		mat4.translate(transformMatrix,
		             transformMatrix,
		             [x/10, y/10, 0]);//Math.cos(now/100)/10]);

		gl.uniformMatrix4fv(programInfo.modelViewLocation, false, modelViewMatrix);
		gl.uniformMatrix4fv(programInfo.transformLocation, false,
		transformMatrix);

		gl.uniform1i(programInfo.uSamplerLocation, frame.texture.index);

		{
			const vertexCount = textureFactory.vertexCount;
			const type = gl.UNSIGNED_SHORT;
			const offset = 0;
			gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
		}  
	}


	function initShaderProgram(gl, vsSource, fsSource) {
	  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	  const shaderProgram = gl.createProgram();
	  gl.attachShader(shaderProgram, vertexShader);
	  gl.attachShader(shaderProgram, fragmentShader);
	  gl.linkProgram(shaderProgram);

	  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
	    return null;
	  }

	  return shaderProgram;
	}

	function loadShader(gl, type, source) {
	  const shader = gl.createShader(type);
	  gl.shaderSource(shader, source);
	  gl.compileShader(shader);

	  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
	    gl.deleteShader(shader);
	    return null;
	  }
	  return shader;
	}

	WebGLRenderingContext.prototype.getSpriteRenderer = function() {
		if(!this.spriteRenderer) {
			this.spriteRenderer = new SpriteRenderer.Renderer(this);
		}
		return this.spriteRenderer;
	};

	return {
		Renderer,
	};
})();