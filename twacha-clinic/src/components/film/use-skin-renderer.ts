'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { fragmentShader, vertexShader } from './skin-shader';

type Gl = WebGLRenderingContext;

function compile(gl: Gl, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[skin-film] shader compile failed', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Max pixels rendered per frame; larger canvases are drawn at reduced scale and upscaled. */
const PIXEL_BUDGET = 1_600_000;

/**
 * Drives the hero shader on a canvas. Reads scroll progress from `progress`
 * every frame, only animates while the canvas is on screen, and reports
 * `supported: false` when WebGL is unavailable so the caller can show the
 * CSS fallback.
 */
export function useSkinRenderer(canvasRef: RefObject<HTMLCanvasElement | null>, progress: RefObject<number>, animate: boolean) {
  const [supported, setSupported] = useState(true);
  const renderRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'high-performance' });
    if (!gl) {
      setSupported(false);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, vertexShader);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      setSupported(false);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setSupported(false);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'uRes');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uP = gl.getUniformLocation(program, 'uP');
    const uMouse = gl.getUniformLocation(program, 'uMouse');

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      let w = canvas.clientWidth * dpr;
      let h = canvas.clientHeight * dpr;
      const over = (w * h) / PIXEL_BUDGET;
      if (over > 1) {
        w /= Math.sqrt(over);
        h /= Math.sqrt(over);
      }
      canvas.width = Math.max(1, Math.round(w));
      canvas.height = Math.max(1, Math.round(h));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const start = performance.now();
    const draw = (now = performance.now()) => {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, animate ? (now - start) / 1000 : 0);
      gl.uniform1f(uP, progress.current ?? 0);
      gl.uniform2f(uMouse, mouse.x, -mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    renderRef.current = () => draw();

    resize();
    draw();

    let raf = 0;
    let visible = true;
    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && animate) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    if (animate) window.addEventListener('pointermove', onPointer, { passive: true });

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      setSupported(false);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [canvasRef, progress, animate]);

  const renderOnce = useCallback(() => renderRef.current(), []);
  return { supported, renderOnce };
}
