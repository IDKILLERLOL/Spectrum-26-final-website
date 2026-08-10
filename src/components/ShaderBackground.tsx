import { useEffect, useRef } from 'react';

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Sync size function
    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_light_mode;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = v_texCoord;
    vec2 p = (v_texCoord - 0.5) * u_resolution / min(u_resolution.x, u_resolution.y);
    vec2 mouse = (u_mouse / u_resolution - 0.5) * u_resolution / min(u_resolution.x, u_resolution.y);
    
    float color = 0.0;
    
    // Grid dots - Rule 4 spacing and opacity
    float grid_freq = mix(20.0, 14.0, u_light_mode);
    float grid_opacity = mix(0.1, 0.06, u_light_mode);
    vec2 g = fract(p * grid_freq) - 0.5;
    float d = length(g);
    float grid = smoothstep(0.1, 0.05, d) * grid_opacity;
    
    // Moving particles
    for(float i=0.0; i<30.0; i++) {
        float h = hash(vec2(i, 1.0));
        
        // Particle Position (organic random movement)
        float h2 = hash(vec2(i, 2.0));
        float h3 = hash(vec2(i, 3.0));
        float t = u_time * (0.15 + h * 0.15);
        vec2 pos = vec2(
            sin(t * (1.2 + h * 0.5) + h2 * 6.28) * 0.45 + sin(t * (0.5 + h3 * 0.3) - h2 * 3.14) * 0.15,
            cos(t * (0.9 + h2 * 0.4) - h3 * 6.28) * 0.45 + cos(t * (0.4 + h * 0.2) + h * 3.14) * 0.15
        );
        
        float dist = length(p - pos);
        float mouseDist = length(p - mouse);
        
        // React to mouse
        float repulsion = smoothstep(0.3, 0.0, mouseDist) * 0.1;
        dist -= repulsion;
        
        float particle = smoothstep(0.005, 0.0, dist);
        color += particle;
    }
    
    // Scale down particle intensity in light mode for better text readability
    float particle_opacity = mix(1.0, 0.25, u_light_mode);
    float val = color * particle_opacity + grid;
    
    float vig_factor = mix(0.8, 0.4, u_light_mode);
    float vig = 1.0 - length(p) * vig_factor;
    
    vec3 bg = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0), u_light_mode);
    vec3 fg = mix(vec3(1.0, 1.0, 1.0), vec3(0.0, 0.0, 0.0), u_light_mode);
    vec3 finalColor = mix(bg, fg, val * vig);
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;

    function cs(type: number, src: string) {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(s));
      }
      return s;
    }

    const vertexShader = cs(gl.VERTEX_SHADER, vs);
    const fragmentShader = cs(gl.FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uLightMode = gl.getUniformLocation(prog, 'u_light_mode');
    console.log('[WebGL] u_light_mode location:', uLightMode);

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    let lastLightMode = false;
    let animationFrameId: number;
    function render(t: number) {
      if (!canvas || !gl || !prog) return;
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);

      const html = document.documentElement;
      const isLightMode = html.getAttribute('data-theme') === 'light' || 
                          html.classList.contains('light') || 
                          html.classList.contains('invert-colors');

      if (isLightMode !== lastLightMode) {
        console.log('[WebGL] Theme updated in shader to:', isLightMode ? 'light' : 'dark', 
                    'data-theme:', html.getAttribute('data-theme'), 
                    'classes:', html.className);
        lastLightMode = isLightMode;
      }
      if (uLightMode) gl.uniform1f(uLightMode, isLightMode ? 1.0 : 0.0);

      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }

    render(0);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none" style={{ display: 'block' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
