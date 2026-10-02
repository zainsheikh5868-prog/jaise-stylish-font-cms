'use client';
import {useMemo,useState} from 'react';
import {generateStyles,generateUsername} from '../lib/font-engine';
export default function FontGenerator(){
 const [text,setText]=useState('Stylish Name'); const [copied,setCopied]=useState(''); const [cat,setCat]=useState('gaming');
 const styles=useMemo(()=>generateStyles(text||'Stylish Name').slice(0,72),[text]);
 async function copy(v,id){await navigator.clipboard.writeText(v);setCopied(id);setTimeout(()=>setCopied(''),900)}
 return <div className="tool-card">
  <textarea className="tool-input" value={text} maxLength={120} onChange={e=>setText(e.target.value)} aria-label="Text to style" placeholder="Type your name here…" />
  <div className="toolbar"><span>{styles.length} live styles</span><span>No image fonts — real copyable Unicode</span></div>
  <div className="field" style={{maxWidth:330}}><label>Username category</label><select value={cat} onChange={e=>setCat(e.target.value)}><option value="gaming">Gaming</option><option value="instagram">Instagram Aesthetic</option><option value="tiktok">TikTok</option><option value="anime">Anime</option><option value="clan">Clan / Esports</option><option value="vibe">Cool / Vibe</option></select></div>
  <div className="style-row" style={{marginBottom:10}}><div className="style-text"><div className="style-label">Username Generator</div>{generateUsername(text||'Player',cat)}</div><button className="copy" onClick={()=>copy(generateUsername(text||'Player',cat),'username')}>{copied==='username'?'Copied!':'Copy'}</button></div>
  <div className="grid">{styles.map(s=><div className="style-row" key={s.id}><div className="style-text"><div className="style-label">{s.label}</div>{s.value}</div><button className="copy" onClick={()=>copy(s.value,s.id)}>{copied===s.id?'Copied!':'Copy'}</button></div>)}</div>
 </div>
}
