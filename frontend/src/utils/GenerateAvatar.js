// Updated to DiceBear v7 API
const generateDiceBearAvataaars = (seed) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

const generateDiceBearBottts = (seed) =>
  `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;

const generateDiceBearPixelArt = (seed) =>
  `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;

export const generateAvatar = () => {
  const data = [];

  for (let i = 0; i < 2; i++) {
    const res = generateDiceBearAvataaars(Math.random());
    data.push(res);
  }
  for (let i = 0; i < 2; i++) {
    const res = generateDiceBearBottts(Math.random());
    data.push(res);
  }
  for (let i = 0; i < 2; i++) {
    const res = generateDiceBearPixelArt(Math.random());
    data.push(res);
  }
  return data;
};
