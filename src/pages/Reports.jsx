import React,{useEffect,useState} from 'react'
import { supabase } from '../lib/supabase'
export default function Reports(){
  const[rows,setRows]=useState([]);const[filter,setFilter]=useState('all')
  async function load(){let q=supabase.from('item_reports').select('id,title,report_type,category,brand,color,location_text,event_date,status,created_at').order('created_at',{ascending:false});if(filter!=='all')q=q.eq('status',filter);const{data}=await q;setRows(data||[])}
  useEffect(()=>{load()},[filter])
  return <section><header className="page-head"><div><span className="eyebrow">ITEMS</span><h1>Reports</h1><p>Track submissions from open report through recovery.</p></div><select className="select" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="open">Open</option><option value="matched">Matched</option><option value="claimed">Claimed</option><option value="recovered">Recovered</option></select></header><div className="table-card"><table><thead><tr><th>Item</th><th>Type</th><th>Category</th><th>Location</th><th>Date</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><b>{r.title}</b><small>{[r.brand,r.color].filter(Boolean).join(' · ')}</small></td><td><span className={'pill '+r.report_type}>{r.report_type}</span></td><td>{r.category}</td><td>{r.location_text}</td><td>{r.event_date}</td><td><span className={'status '+r.status}>{r.status}</span></td></tr>)}</tbody></table>{!rows.length&&<div className="empty">No reports yet.</div>}</div></section>
}
