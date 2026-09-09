import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FileSearch, BadgeCheck, LogOut, Link2, GitCompareArrows, QrCode } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Swal from 'sweetalert2'
export default function Shell(){return <div className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-icon"><Link2 size={20}/></div><div><b>LostLink</b><span>Admin Console</span></div></div><nav>
<NavLink to="/"><LayoutDashboard size={18}/>Dashboard</NavLink>
<NavLink to="/reports"><FileSearch size={18}/>Reports</NavLink>
<NavLink to="/matches"><GitCompareArrows size={18}/>Matches</NavLink>
<NavLink to="/claims"><BadgeCheck size={18}/>Claims</NavLink>
<NavLink to="/qr-verification">
  Verify QR
</NavLink>
</nav><button className="logout" onClick={()=>supabase.auth.signOut()}><LogOut size={18}/>Sign out</button></aside><main><Outlet/></main></div>}
