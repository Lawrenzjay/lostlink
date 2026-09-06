import React,{useEffect,useState} from 'react'
import { supabase } from '../lib/supabase'

export default function Matches(){
  const[rows,setRows]=useState([]); const[error,setError]=useState('')
  async function load(){
    const {data,error}=await supabase.from('match_details').select('*').order('match_score',{ascending:false})
    if(error)setError(error.message); else{setError('');setRows(data||[])}
  }
  useEffect(()=>{load()},[])
  return <section>
    <header className="page-head"><div><span className="eyebrow">INTELLIGENT MATCHING</span><h1>Possible Matches</h1><p>Review ranked lost/found pairs generated automatically by LostLink.</p></div><button className="ghost" onClick={load}>Refresh</button></header>
    {error&&<div className="error-panel">{error}</div>}
    <div className="match-grid">{rows.map(m=><article className="match-card" key={m.id}>
      <div className="match-top"><span className="score">{Math.round(Number(m.match_score))}%</span><span className="pill">{m.match_status}</span></div>
      <div className="match-columns"><div><small>LOST</small><h3>{m.lost_title}</h3><p>{m.lost_category} · {m.lost_brand||'No brand'} · {m.lost_color||'No color'}</p><p>{m.lost_location} · {m.lost_date}</p></div><div><small>FOUND</small><h3>{m.found_title}</h3><p>{m.found_category} · {m.found_brand||'No brand'} · {m.found_color||'No color'}</p><p>{m.found_location} · {m.found_date}</p></div></div>
      <div className="score-breakdown"><span>Category {Math.round(m.category_score)}/25</span><span>Brand {Math.round(m.brand_score)}/15</span><span>Color {Math.round(m.color_score)}/15</span><span>Location {Math.round(m.location_score)}/15</span><span>Date {Math.round(m.date_score)}/10</span><span>Description {Math.round(m.description_score)}/20</span></div>
    </article>)}{!rows.length&&!error&&<div className="empty">No generated matches yet.</div>}</div>
  </section>
}
