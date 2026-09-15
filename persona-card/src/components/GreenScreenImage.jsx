import { useEffect, useRef, useState } from 'react';

// 前端绿幕/纯色背景抠像（v5 · 洪水填充，只抠与边缘连通的背景）：
//
// 为什么 v5：逐像素按颜色抠像时，主体身上与背景同色的元素（如烟火守艺型的
// 绿丝巾/绿袖口/绿鞋 vs 绿背景）会被误抠成透明。v5 改为：
//   1. 采样四角推断背景色；
//   2. 从画面边缘的背景色种子出发 BFS 洪水填充，只有「与边缘连通」的区域才算背景；
//      扩散时与邻居比色差（小步长），带渐变的背景也能整片填到；
//   3. 背景连通区内按颜色距离做软透明 + 溢出抑制；
//   4. 不连通的同色内部元素（丝巾、袖口等）完全不动；仅与背景直接相邻的轮廓带做去溢出（去绿边）；
//   5. 水印去除保持不变（右下角区域擦除 + 底部浅色文字兜底）。
//
// 参数：
//   tolerance 完全透明阈值（默认 0.30）
//   edge      羽化过渡带宽度（默认 0.18）
//   spill     溢出抑制强度（默认 0.60）
//   watermark 是否去除水印（默认 true）
//   autoKey   自动检测背景色（默认 false）
//   flood     洪水填充开关（默认 true；autoKey 时生效，关掉回退 v4 逐像素行为）
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
  flood = true,
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

        // —— autoKey：采样四角，推断背景色 ——
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
        const bgIsGreen = bgG01 > bgR01 + 0.08 && bgG01 > bgB01 + 0.08;

        // 溢出抑制：压掉保留像素里相对多余的背景色分量（去绿边等）
        const suppress = (i) => {
          const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
          if (bgIsGreen) {
            const excess = Math.max(0, g - Math.max(r, b));
            data[i + 1] = Math.round(Math.max(Math.max(r, b), g - excess * spill) * 255);
          } else {
            if (bgR01 > bgAvg01) data[i] = Math.round(Math.max(Math.max(g, b), r - Math.max(0, r - Math.max(g, b)) * spill) * 255);
            if (bgG01 > bgAvg01) data[i + 1] = Math.round(Math.max(Math.max(r, b), g - Math.max(0, g - Math.max(r, b)) * spill) * 255);
            if (bgB01 > bgAvg01) data[i + 2] = Math.round(Math.max(Math.max(r, g), b - Math.max(0, b - Math.max(r, g)) * spill) * 255);
          }
        };

        const isWatermark = (px, py) => {
          if (px > w * 0.72 && py > h * 0.86) return true;
          if (py > h * 0.82) {
            const light = (data[(py * w + px) * 4] + data[(py * w + px) * 4 + 1] + data[(py * w + px) * 4 + 2]) / 3;
            const maxc = Math.max(data[(py * w + px) * 4], data[(py * w + px) * 4 + 1], data[(py * w + px) * 4 + 2]);
            const minc = Math.min(data[(py * w + px) * 4], data[(py * w + px) * 4 + 1], data[(py * w + px) * 4 + 2]);
            if ((data[(py * w + px) * 4] > 170 && data[(py * w + px) * 4 + 1] > 170 && data[(py * w + px) * 4 + 2] > 170) || (maxc - minc < 40 && light > 110)) return true;
          }
          return false;
        };

        if (autoKey && useColorKey && flood) {
          // ===== v5：洪水填充式抠像 =====
          const n = w * h;

          // 1) 每像素与背景色的距离（归一化到 0~1）
          const dist = new Float32Array(n);
          for (let p = 0; p < n; p++) {
            const i = p * 4;
            const dr = data[i] / 255 - bgR01;
            const dg = data[i + 1] / 255 - bgG01;
            const db = data[i + 2] / 255 - bgB01;
            dist[p] = Math.sqrt(dr * dr + dg * dg + db * db) / 1.732;
          }

          // 2) 从边缘背景色种子 BFS；扩散=与邻居色差小（顺渐变爬坡）且离背景色不太远
          const bgMask = new Uint8Array(n);
          const queue = new Int32Array(n);
          let qt = 0;
          const seed = (p) => {
            if (!bgMask[p] && dist[p] < tolerance) { bgMask[p] = 1; queue[qt++] = p; }
          };
          for (let x = 0; x < w; x++) { seed(x); seed((h - 1) * w + x); }
          for (let y = 0; y < h; y++) { seed(y * w); seed(y * w + w - 1); }

          const growDiff2 = 0.085 * 0.085;   // 与邻居色差平方阈值（顺着渐变走）
          const dCap = Math.min(0.5, tolerance * 2.4); // 距全局背景色的安全上限
          const near = (a, b) => {
            const dr = (data[a] - data[b]) / 255;
            const dg = (data[a + 1] - data[b + 1]) / 255;
            const db = (data[a + 2] - data[b + 2]) / 255;
            return dr * dr + dg * dg + db * db <= growDiff2;
          };

          for (let qh = 0; qh < qt; qh++) {
            const p = queue[qh];
            const a = p * 4;
            const px = p % w;
            const py = (p / w) | 0;
            if (px > 0)     { const q = p - 1; if (!bgMask[q] && dist[q] < dCap && near(a, q * 4)) { bgMask[q] = 1; queue[qt++] = q; } }
            if (px < w - 1) { const q = p + 1; if (!bgMask[q] && dist[q] < dCap && near(a, q * 4)) { bgMask[q] = 1; queue[qt++] = q; } }
            if (py > 0)     { const q = p - w; if (!bgMask[q] && dist[q] < dCap && near(a, q * 4)) { bgMask[q] = 1; queue[qt++] = q; } }
            if (py < h - 1) { const q = p + w; if (!bgMask[q] && dist[q] < dCap && near(a, q * 4)) { bgMask[q] = 1; queue[qt++] = q; } }
          }

          // 3) 与背景直接相邻的轮廓带（只去溢出、不降透明度，避免绿描边）
          const band = new Uint8Array(n);
          for (let p = 0; p < n; p++) {
            if (bgMask[p]) continue;
            const px = p % w;
            const py = (p / w) | 0;
            if (
              (px > 0 && bgMask[p - 1]) || (px < w - 1 && bgMask[p + 1]) ||
              (py > 0 && bgMask[p - w]) || (py < h - 1 && bgMask[p + w])
            ) band[p] = 1;
          }

          // 4) 合成：背景→软透明+去溢出；轮廓带→只去溢出；内部同色元素→完全不动
          for (let p = 0; p < n; p++) {
            const i = p * 4;
            const px = p % w;
            const py = (p / w) | 0;
            if (watermark && isWatermark(px, py)) { data[i + 3] = 0; continue; }
            if (bgMask[p]) {
              const d = dist[p];
              let alpha = 1;
              if (d < tolerance) alpha = 0;
              else if (d < tolerance + edge) alpha = (d - tolerance) / edge;
              if (alpha > 0) suppress(i);
              data[i + 3] = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
            } else if (band[p]) {
              suppress(i);
            }
            // 其余像素保持原样（丝巾/袖口等同色内部元素不再被误抠）
          }
          ctx.putImageData(imageData, 0, 0);
        } else {
          // ===== v4：逐像素抠像（绿幕旧图 / 关闭 flood 时） =====
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i] / 255;
            const g = data[i + 1] / 255;
            const b = data[i + 2] / 255;
            const px = ((i / 4) % w) | 0;
            const py = ((i / 4 / w) | 0);

            if (watermark && isWatermark(px, py)) { data[i + 3] = 0; continue; }

            let alpha = 1;
            if (useColorKey) {
              const dr = r - bgR01, dg = g - bgG01, db = b - bgB01;
              const d = Math.sqrt(dr * dr + dg * dg + db * db) / 1.732;
              if (d < tolerance) alpha = 0;
              else if (d < tolerance + edge) alpha = (d - tolerance) / edge;
              if (alpha > 0) suppress(i);
            } else {
              const maxOther = Math.max(r, b);
              const greenExcess = g - maxOther;
              if (greenExcess > tolerance && g > 0.28) alpha = 0;
              else if (greenExcess > tolerance - edge && g > 0.18) alpha = (tolerance - greenExcess) / edge;
              if (alpha > 0) {
                const amount = Math.max(0, greenExcess) * spill;
                data[i + 1] = Math.round(Math.max(Math.max(r, b), g - amount) * 255);
              }
            }
            data[i + 3] = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
          }
          ctx.putImageData(imageData, 0, 0);
        }
      } catch (e) {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0);
      }

      setLoaded(true);
      onLoad?.();
    };

    img.onerror = () => setLoaded(true);
  }, [src, onLoad, tolerance, edge, spill, watermark, autoKey, flood]);

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
