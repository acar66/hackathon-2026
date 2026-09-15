import { useEffect, useRef, useState } from 'react';

// 前端绿幕/纯色背景抠像（v4 · 支持自动检测背景色）：
// 1. 默认仍是「绿色通道相对优势」软边缘抠像，兼容已有绿幕图。
// 2. autoKey=true 时自动采样四角推断背景色，按 RGB 距离抠像；可处理青绿、蓝、灰等纯色背景。
// 3. 对保留像素做绿溢/背景色溢出抑制，去掉边缘色边。
// 4. 水印去除：右下角区域直接擦除 + 底部浅色文字兜底。
//
// 参数：
//   src       图片路径
//   className 样式类
//   onLoad    加载完成回调
//   style     覆盖默认样式
//   tolerance 完全透明阈值（默认 0.30）
//   edge      羽化过渡带宽度（默认 0.18）
//   spill     溢出抑制强度（默认 0.60）
//   watermark 是否去除水印（默认 true）
//   autoKey   是否自动检测四角背景色并基于颜色距离抠像（默认 false，绿幕图可不开）
export default function GreenScreenImage({
  src,
  alt,
  className,
  onLoad,
  style,
  tolerance = 0.30,
  edge = 0.18,
  spill = 0.60,
  watermark = true,
  autoKey = false,
}) {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        // —— autoKey：采样四角，推断纯色背景 ——
        let bgR = 0, bgG = 255, bgB = 0;
        let useColorKey = false;
        if (autoKey) {
          const sample = Math.min(12, Math.max(4, Math.floor(Math.min(w, h) * 0.06)));
          const samples = [];
          const corners = [
            [0, 0],
            [w - sample, 0],
            [0, h - sample],
            [w - sample, h - sample],
          ];
          for (const [sx, sy] of corners) {
            for (let y = sy; y < sy + sample && y < h; y++) {
              for (let x = sx; x < sx + sample && x < w; x++) {
                const idx = (y * w + x) * 4;
                samples.push([data[idx], data[idx + 1], data[idx + 2]]);
              }
            }
          }
          if (samples.length) {
            bgR = samples.reduce((s, c) => s + c[0], 0) / samples.length;
            bgG = samples.reduce((s, c) => s + c[1], 0) / samples.length;
            bgB = samples.reduce((s, c) => s + c[2], 0) / samples.length;
            useColorKey = true;
          }
        }

        const bgR01 = bgR / 255;
        const bgG01 = bgG / 255;
        const bgB01 = bgB / 255;
        const bgAvg01 = (bgR01 + bgG01 + bgB01) / 3;
        // 背景是否明显偏绿（和默认绿幕算法一致的场景）
        const bgIsGreen = bgG01 > bgR01 + 0.08 && bgG01 > bgB01 + 0.08;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          const px = (i / 4) % w;
          const py = Math.floor(i / 4 / w);

          // —— 水印去除 ——
          if (watermark) {
            if (px > w * 0.72 && py > h * 0.86) {
              data[i + 3] = 0;
              continue;
            }
            if (py > h * 0.82) {
              const light = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const maxc = Math.max(data[i], data[i + 1], data[i + 2]);
              const minc = Math.min(data[i], data[i + 1], data[i + 2]);
              if ((data[i] > 170 && data[i + 1] > 170 && data[i + 2] > 170) || (maxc - minc < 40 && light > 110)) {
                data[i + 3] = 0;
                continue;
              }
            }
          }

          let alpha = 1;

          if (useColorKey) {
            // —— 基于背景色距离的软边缘抠像 ——
            const dr = r - bgR01;
            const dg = g - bgG01;
            const db = b - bgB01;
            const dist = Math.sqrt(dr * dr + dg * dg + db * db) / 1.732;

            if (dist < tolerance) {
              alpha = 0;
            } else if (dist < tolerance + edge) {
              alpha = (dist - tolerance) / edge;
              alpha = Math.max(0, Math.min(1, alpha));
            }

            // —— 背景色溢出抑制 ——
            if (alpha > 0) {
              if (bgIsGreen) {
                // 背景偏绿：沿用绿溢抑制
                const greenExcess = g - Math.max(r, b);
                const spillAmount = Math.max(0, greenExcess) * spill;
                const targetG = Math.max(r, b);
                const newG = Math.max(targetG, g - spillAmount);
                data[i + 1] = Math.round(newG * 255);
              } else {
                // 通用：抑制所有高于平均的背景通道
                if (bgR01 > bgAvg01) {
                  const excess = Math.max(0, r - Math.max(g, b));
                  data[i] = Math.max(0, Math.min(255, Math.round((r - excess * spill) * 255)));
                }
                if (bgG01 > bgAvg01) {
                  const excess = Math.max(0, g - Math.max(r, b));
                  data[i + 1] = Math.max(0, Math.min(255, Math.round((g - excess * spill) * 255)));
                }
                if (bgB01 > bgAvg01) {
                  const excess = Math.max(0, b - Math.max(r, g));
                  data[i + 2] = Math.max(0, Math.min(255, Math.round((b - excess * spill) * 255)));
                }
              }
            }
          } else {
            // —— 原绿幕抠像（兼容旧图） ——
            const maxOther = Math.max(r, b);
            const greenExcess = g - maxOther;

            if (greenExcess > tolerance && g > 0.28) {
              alpha = 0;
            } else if (greenExcess > tolerance - edge && g > 0.18) {
              alpha = (tolerance - greenExcess) / edge;
              alpha = Math.max(0, Math.min(1, alpha));
            }

            if (alpha > 0) {
              const spillAmount = Math.max(0, greenExcess) * spill;
              const targetG = Math.max(r, b);
              const newG = Math.max(targetG, g - spillAmount);
              data[i + 1] = Math.round(newG * 255);
            }
          }

          data[i + 3] = Math.round(alpha * 255);
        }

        ctx.putImageData(imageData, 0, 0);
      } catch (e) {
        // 安全域限制时回退：直接显示原图
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0);
      }

      setLoaded(true);
      onLoad?.();
    };

    img.onerror = () => setLoaded(true);
  }, [src, onLoad, tolerance, edge, spill, watermark, autoKey]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={alt}
      className={className}
      style={{
        opacity: loaded ? 1 : 0,
        transition: 'opacity .4s ease',
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
}
