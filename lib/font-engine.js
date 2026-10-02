// Pure JavaScript Unicode styling engine. No runtime dependency.
const ASCII_UP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ASCII_LO = 'abcdefghijklmnopqrstuvwxyz';
const ASCII_NUM = '0123456789';
const chars = s => Array.from(s);
const contiguous = (start, count) => Array.from({length:count}, (_,i)=>String.fromCodePoint(start+i));

const alphabets = {
  bold: [...contiguous(0x1D400,26), ...contiguous(0x1D41A,26), ...contiguous(0x1D7CE,10)],
  italic: [...contiguous(0x1D434,26), ...contiguous(0x1D44E,26), ...chars('0123456789')],
  boldItalic: [...contiguous(0x1D468,26), ...contiguous(0x1D482,26), ...chars('0123456789')],
  sans: [...contiguous(0x1D5A0,26), ...contiguous(0x1D5BA,26), ...contiguous(0x1D7E2,10)],
  sansBold: [...contiguous(0x1D5D4,26), ...contiguous(0x1D5EE,26), ...contiguous(0x1D7EC,10)],
  sansItalic: [...contiguous(0x1D608,26), ...contiguous(0x1D622,26), ...chars('0123456789')],
  sansBoldItalic: [...contiguous(0x1D63C,26), ...contiguous(0x1D656,26), ...chars('0123456789')],
  mono: [...contiguous(0x1D670,26), ...contiguous(0x1D68A,26), ...contiguous(0x1D7F6,10)],
  double: [...chars('𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ'), ...chars('𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫'), ...chars('𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡')],
  fraktur: [...chars('𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ'), ...contiguous(0x1D51E,26), ...chars('0123456789')],
  frakturBold: [...contiguous(0x1D56C,26), ...contiguous(0x1D586,26), ...chars('0123456789')],
  script: [...chars('𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵'), ...chars('𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏'), ...chars('0123456789')],
  scriptBold: [...contiguous(0x1D4D0,26), ...contiguous(0x1D4EA,26), ...chars('0123456789')],
  circled: [...contiguous(0x24B6,26), ...contiguous(0x24D0,26), ...chars('⓪①②③④⑤⑥⑦⑧⑨')],
  fullwidth: [...contiguous(0xFF21,26), ...contiguous(0xFF41,26), ...contiguous(0xFF10,10)],
  parenthesized: [...contiguous(0x1F110,26), ...contiguous(0x249C,26), ...chars('0⑴⑵⑶⑷⑸⑹⑺⑻⑼')],
};

const specials = {
  superscript: Object.fromEntries([...chars('abcdefghijklmnopqrstuvwxyz0123456789+-=()')].map((c,i)=>[c, chars('ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᑫʳˢᵗᵘᵛʷˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾')[i] || c])),
  subscript: {a:'ₐ',e:'ₑ',h:'ₕ',i:'ᵢ',j:'ⱼ',k:'ₖ',l:'ₗ',m:'ₘ',n:'ₙ',o:'ₒ',p:'ₚ',r:'ᵣ',s:'ₛ',t:'ₜ',u:'ᵤ',v:'ᵥ',x:'ₓ','0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','+':'₊','-':'₋','=':'₌','(':'₍',')':'₎'},
  tinyCaps: {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'},
  upsideDown: {a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ᴉ',j:'ɾ',k:'ʞ',l:'l',m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z','?':'¿','!':'¡'},
};

const source = ASCII_UP + ASCII_LO + ASCII_NUM;
function mapAlphabet(text, name) {
  const target = alphabets[name];
  if (!target) return text;
  const map = new Map(Array.from(source).map((c,i)=>[c,target[i] ?? c]));
  return Array.from(text).map(c=>map.get(c) ?? c).join('');
}
function mapSpecial(text, mapName, reverse=false) {
  const map = specials[mapName] || {};
  const out = Array.from(text).map(c => map[c] || map[c.toLowerCase()] || c).join('');
  return reverse ? Array.from(out).reverse().join('') : out;
}

const decorators = [
  ['Clean','{x}'], ['Stars','★彡{x}彡★'], ['Royal','꧁༒{x}༒꧂'], ['Brackets','『{x}』'],
  ['Wings','꧁𓊈𒆜{x}𒆜𓊉꧂'], ['Sparkle','✨ {x} ✨'], ['Hearts','♥︎ {x} ♥︎'], ['Dots','•°• {x} •°•'],
  ['Arrow','➳ {x} ࿐'], ['Crown','♛ {x} ♛'], ['Moon','☾ {x} ☽'], ['Flower','✿ {x} ✿'],
  ['Weapon','︻デ═一 {x}'], ['Skull','☠ {x} ☠'], ['Anime','亗 {x} 亗'], ['Clan','乂 {x} 乂']
];

export const baseStyles = [
  ['Bold','bold'],['Italic','italic'],['Bold Italic','boldItalic'],['Sans','sans'],['Sans Bold','sansBold'],
  ['Sans Italic','sansItalic'],['Sans Bold Italic','sansBoldItalic'],['Monospace','mono'],['Double Struck','double'],
  ['Fraktur','fraktur'],['Bold Fraktur','frakturBold'],['Cursive','script'],['Bold Cursive','scriptBold'],
  ['Circled','circled'],['Fullwidth','fullwidth'],['Parenthesized','parenthesized']
];

export function zalgo(text, intensity=1) {
  const above=['̍','̎','̄','̅','̿','̑','̆','̐','͒','͗','͑','̇','̈','̊','͂','̓'];
  const below=['̖','̗','̘','̙','̜','̝','̞','̟','̠','̤','̥','̦','̩','̪','̫','̬','̭'];
  const middle=['̕','̛','̀','́','͘','̡','̢','̧','̨','̴','̵','̶'];
  const pick=(arr,i)=>arr[i%arr.length];
  return Array.from(text).map((c,i)=> c===' ' ? c : c + pick(above,i*3) + (intensity>1?pick(middle,i*5):'') + pick(below,i*7)).join('');
}
export function japaneseAesthetic(text){ return `「${Array.from(text).join('・')}」`; }
export function bubble(text){ return mapAlphabet(text,'circled'); }
export function tiny(text){ return mapSpecial(text,'tinyCaps'); }
export function superscript(text){ return mapSpecial(text,'superscript'); }
export function subscript(text){ return mapSpecial(text,'subscript'); }
export function upsideDown(text){ return mapSpecial(text,'upsideDown',true); }

export function generateStyles(text) {
  const results=[];
  baseStyles.forEach(([label,key]) => results.push({id:key,label,value:mapAlphabet(text,key)}));
  results.push({id:'tiny',label:'Tiny Caps',value:tiny(text)});
  results.push({id:'super',label:'Superscript',value:superscript(text)});
  results.push({id:'sub',label:'Subscript',value:subscript(text)});
  results.push({id:'upside',label:'Upside Down',value:upsideDown(text)});
  results.push({id:'zalgo',label:'Glitch / Zalgo',value:zalgo(text,2)});
  results.push({id:'jp',label:'Japanese Aesthetic',value:japaneseAesthetic(text)});

  // Produces 64+ practical decorated variants without mutating the original input.
  const seeds = [
    ['Plain', text],
    ['Bold', mapAlphabet(text,'bold')],
    ['Cursive', mapAlphabet(text,'scriptBold')]
  ];
  seeds.forEach(([seedName,seed]) => decorators.forEach(([name,tpl]) => {
    results.push({id:`${seedName}-${name}`.toLowerCase().replace(/\s+/g,'-'), label:`${seedName} ${name}`, value:tpl.replace('{x}',seed)});
  }));
  return results;
}

const pools = {
  gaming: {pre:['亗','乂','メ','ツ','彡','么'], post:['亗','乂','ツ','彡','࿐','么']},
  instagram: {pre:['♡','୨୧','˚₊‧','⋆౨ৎ˚⟡˖'], post:['♡','୨୧','✧','⋆.ೃ࿔*:･']},
  tiktok: {pre:['✦','シ','ツ','ꨄ'], post:['✦','シ','ツ','ꨄ']},
  anime: {pre:['『','「','亗','〆'], post:['』','」','亗','〆']},
  clan: {pre:['[NOVA]','[VTX]','[RDX]','[ACE]'], post:['YT','OP','X','ツ']},
  vibe: {pre:['☾','✧','𓆩','ミ★'], post:['☽','✧','𓆪','★彡']}
};
export function generateUsername(name='Player', category='gaming', prefix='', suffix='', seed=Date.now()) {
  const p=pools[category]||pools.gaming;
  const idx=Math.abs(Number(seed))%p.pre.length;
  const stylized = mapAlphabet(name, ['sansBold','scriptBold','frakturBold','double'][idx%4]);
  return `${prefix}${p.pre[idx]}${stylized}${p.post[(idx+1)%p.post.length]}${suffix}`;
}
