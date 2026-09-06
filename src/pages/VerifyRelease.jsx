import React,{useEffect,useRef,useState} from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../lib/supabase'

export default function VerifyRelease(){
  const[code,setCode]=useState(''); const[result,setResult]=useState(null); const[error,setError]=useState(''); const[busy,setBusy]=useState(false); const scanned=useRef(false)
  async function release(raw){
    const value=(raw||code).trim(); if(!value)return
    setBusy(true);setError('');setResult(null)
    const {data,error}=await supabase.rpc('admin_release_claim',{p_claim_code:value})
    if(error)setError(error.message); else{setResult(Array.isArray(data)?data[0]:data);setCode(value)}
    setBusy(false)
  }
  useEffect(()=>{
    const scanner=new Html5QrcodeScanner('qr-reader',{fps:8,qrbox:{width:220,height:220}},false)
    scanner.render(text=>{ if(scanned.current)return; scanned.current=true; setCode(text); release(text).finally(()=>setTimeout(()=>{scanned.current=false},1500)) },()=>{})
    return()=>{scanner.clear().catch(()=>{})}
  },[])
  return <section><header className="page-head"><div><span className="eyebrow">ITEM RELEASE</span><h1>Verify Claim QR</h1><p>Scan the approved client QR code, or type the claim code manually.</p></div></header>
    <div className="verify-grid"><article className="panel verify-panel"><h2>Camera scanner</h2><div id="qr-reader"></div></article>
    <article className="panel verify-panel"><h2>Manual verification</h2><label className="field-label">Claim code<input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Example: A1B2C3D4E5F6"/></label><button className="primary verify-btn" disabled={busy} onClick={()=>release()}>{busy?'Verifying…':'Verify & Release Item'}</button>
    {error&&<div className="error-panel">{error}</div>}{result&&<div className="success-panel"><b>Release complete</b><p>Claim {result.claim_code} was released. The match is resolved and both item reports are now recovered.</p></div>}</article></div>
  </section>
}
