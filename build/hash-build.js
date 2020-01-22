#!/usr/bin/env node
const md5 = require('md5');
const fs = require('fs').promises;
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const htmlFile = path.join(publicDir, 'index.html');
const oldScriptFile = path.join(publicDir, 'app.js');
const oldStyleFile = path.join(publicDir, 'app.css');

async function replaceReferencesInFile(file, replacements) {
  const filePath = path.join(publicDir, file);
  let contents = (await fs.readFile(filePath)).toString();
  replacements.forEach(([oldName, newName]) => {
    contents = contents.replace(oldName, newName);
  });
  await fs.writeFile(filePath, contents);
}

async function replaceReferencesInDir(replacements) {
  const files = await fs.readdir(publicDir);
  await Promise.all(files.filter(f => path.extname(f).match(/\.js|\.css|\.html|\.map/ig)).map(f => replaceReferencesInFile(f, replacements)));
}

async function hash(oldPath) {
  const oldName = path.basename(oldPath);
  const newName = `app-${md5(await fs.readFile(oldPath))}${path.extname(oldPath)}`;
  const newPath = path.join(publicDir, newName);

  await Promise.all([
    fs.rename(oldPath, newPath),
    fs.rename(oldPath + '.map', newPath + '.map'),
  ]);

  return [oldName, newName];
}

async function hashBuild() {
  const replacements = await Promise.all([
    hash(oldScriptFile),
    hash(oldStyleFile),
  ]);

  replacements.push(['JS_HASH', replacements[0][1].replace('app-', '').replace('.js', '')]);
  replacements.push(['CSS_HASH', replacements[1][1].replace('app-', '').replace('.css', '')]);

  await replaceReferencesInDir(replacements);
}

hashBuild();