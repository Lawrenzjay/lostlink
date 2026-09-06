import React,{useEffect,useState} from 'react'
import { supabase } from '../lib/supabase'

export default function Claims(){
  const[rows,setRows]=useState([]); const[busy,setBusy]=useState(''); const[error,setError]=useState('')
  async function load(){const{data,error}=await supabase.from('claim_details').select('*').order('created_at',{ascending:false});if(error)setError(error.message);else{setError('');setRows(data||[])}}
  useEffect(()=>{load()},[])
  async function review(id,status){
    setBusy(id+status);setError('')
    const {error}=await supabase.rpc('admin_review_claim',{p_claim_id:id,p_status:status})
    if(error)setError(error.message)
    setBusy('');await load()
  }
  return <section><header className="page-head"><div><span className="eyebrow">OWNERSHIP VERIFICATION</span><h1>Claims</h1><p>Compare the match and review the claimant's private ownership proof.</p></div><button className="ghost" onClick={load}>Refresh</button></header>
    {error&&<div className="error-panel">{error}</div>}
    <div className="claim-grid">{rows.map(c=><article className="claim-detail" key={c.id}>
      <div className="claim-head"><div><span className="pill">{c.status}</span><h3>{c.found_title||'Found item'}</h3><p>Claim #{c.id.slice(0,8)} · Match {c.match_score?Math.round(c.match_score)+'%':'—'}</p></div><code>{c.claim_code}</code></div>
      <div className="claim-facts"><div><small>LOST REPORT</small><b>{c.lost_title||'—'}</b></div><div><small>FOUND REPORT</small><b>{c.found_title||'—'}</b><span>{c.found_location||''} {c.found_date?'· '+c.found_date:''}</span></div></div>
      <div className="proof"><small>CLAIMANT'S OWNERSHIP PROOF</small><p>{c.proof_text||'No proof supplied.'}</p></div>
      {c.status==='pending'&&<div className="actions"><button disabled={!!busy} onClick={()=>review(c.id,'rejected')}>Reject</button><button disabled={!!busy} className="primary" onClick={()=>review(c.id,'approved')}>Approve & Issue QR</button></div>}
      {c.status==='approved'&&<div className="approved-note">Approved. Ask the client to open My Claims and present the QR code at release.</div>}
      {c.status==='released'&&<div className="released-note">Released — both reports are now marked recovered.</div>}
    </article>)}{!rows.length&&!error&&<div className="empty">No claims yet.</div>}</div>
  </section>
}
