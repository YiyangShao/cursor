#!/usr/bin/env node
/**
 * 去除图片背景
 * 用法: node scripts/remove-bg.js [--white] [--replace] [目录或文件...]
 *
 * --white:  简单模式，去除接近白色的背景（适合纯白底图，需 sharp）
 * --replace: 覆盖原图（默认输出为 xxx_nobg.png）
 * 默认: 使用 AI 抠图（需 @imgly/background-removal-node，首次下载 ~80MB 模型）
 */

import { readdir, stat, rename, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { tmpdir } from 'os';

const USE_WHITE = process.argv.includes('--white');
const REPLACE = process.argv.includes('--replace');
const ARGS = process.argv.slice(2).filter((a) => !['--white', '--replace'].includes(a));
const TARGET = ARGS[0] || 'public/assets/sprites';

const EXT = ['.png', '.jpg', '.jpeg', '.webp'];
const WHITE_THRESHOLD = 250; // 大于此值的 RGB 视为背景

async function findImages(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await findImages(p)));
    else if (EXT.includes(extname(e.name).toLowerCase())) files.push(p);
  }
  return files;
}

/** 简单白底去除：接近白色的像素设为透明 */
async function removeWhiteBackground(inputPath, outputPath) {
  const sharp = (await import('sharp')).default;
  const img = sharp(inputPath);
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  await sharp(Buffer.from(data), { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);
}

/** AI 抠图 */
async function removeBackgroundAI(inputPath, outputPath) {
  const { removeBackground } = await import('@imgly/background-removal-node');
  const blob = await removeBackground(inputPath);
  const buffer = Buffer.from(await blob.arrayBuffer());
  await writeFile(outputPath, buffer);
}

async function main() {
  const paths = [];
  const s = await stat(TARGET).catch(() => null);
  if (s?.isFile()) paths.push(TARGET);
  else if (s?.isDirectory()) paths.push(...(await findImages(TARGET)));
  else {
    console.error('未找到:', TARGET);
    process.exit(1);
  }

  if (paths.length === 0) {
    console.log('未找到图片');
    return;
  }

  console.log(`处理 ${paths.length} 张图片 (${USE_WHITE ? '白底去除' : 'AI 抠图'})...`);


  for (const p of paths) {
    let out = REPLACE ? join(tmpdir(), `nobg-${Date.now()}-${Math.random().toString(36).slice(2)}${extname(p)}`) : p.replace(/(\.[^.]+)$/, '_nobg$1');
    try {
      if (USE_WHITE) {
        await removeWhiteBackground(p, out);
      } else {
        await removeBackgroundAI(p, out);
      }
      if (REPLACE) {
        await rename(out, p);
        out = p;
      }
      console.log('  ✓', p, '->', out);
    } catch (err) {
      console.error('  ✗', p, err.message);
    }
  }
  console.log('完成');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
