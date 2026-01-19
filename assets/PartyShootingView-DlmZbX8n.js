import{r as o,j as e,u as v}from"./index-coCQNxx_.js";import{c as j,d as w}from"./db-C8Xd2adg.js";function S({eventData:i}){const[d,c]=o.useState(!1),[m,h]=o.useState(Date.now());return o.useEffect(()=>{const l=setInterval(()=>h(Date.now()),1e3);return()=>clearInterval(l)},[]),o.useEffect(()=>{if(i?.broadcast?.overlay?.active){const{timestamp:l,duration:p,permanent:g}=i.broadcast.overlay;g||Date.now()-l<p*1e3?c(!0):c(!1)}else c(!1)},[i?.broadcast?.overlay,m]),e.jsxs(e.Fragment,{children:[d&&i?.broadcast?.overlay&&e.jsx("div",{style:{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",background:"rgba(0,0,0,0.9)",animation:"fadeIn 0.3s ease-out"},children:e.jsx("div",{className:"glass",style:{padding:"4rem",border:"4px solid var(--accent-danger)",borderRadius:"24px",background:"rgba(239, 68, 68, 0.1)",boxShadow:"0 0 50px rgba(220, 38, 38, 0.5)",textAlign:"center",maxWidth:"90vw",willChange:"transform, opacity",animation:"popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"},children:e.jsx("h1",{className:"text-gradient",style:{fontSize:"5rem",margin:0,textTransform:"uppercase",color:"white",textShadow:"0 0 20px var(--accent-danger)",lineHeight:1.2},children:i.broadcast.overlay.message})})}),i?.broadcast?.ticker?.active&&e.jsxs("div",{style:{position:"fixed",bottom:0,left:0,width:"100%",background:"rgba(2, 6, 23, 0.95)",borderTop:"2px solid var(--accent-primary)",color:"white",padding:"1.5rem 0",zIndex:9998,overflow:"hidden",boxShadow:"0 -5px 20px rgba(0,0,0,0.5)"},children:[e.jsx("div",{style:{display:"inline-block",whiteSpace:"nowrap",animation:`marquee ${Math.max(5,45-(i.broadcast.ticker.speed||5)*4)}s linear infinite`,fontSize:"2.5rem",fontWeight:"800",textTransform:"uppercase",color:"var(--accent-primary)",textShadow:"0 0 10px rgba(29, 185, 84, 0.3)",letterSpacing:"2px",willChange:"transform"},children:[...Array(6)].map((l,p)=>e.jsxs("span",{children:[i.broadcast.ticker.message,"   •  "]},p))}),e.jsx("style",{children:`
                        @keyframes marquee {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); } 
                        }
                        @keyframes popIn {
                            from { transform: scale(0.5); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `})]})]})}function N(){const{eventId:i}=v(),[d,c]=o.useState([]),[m,h]=o.useState(null),[l,p]=o.useState(null),[g,u]=o.useState(null),x=r=>{const s=(r.round1||[]).reduce((n,t)=>n+(t||0),0),a=(r.round2||[]).reduce((n,t)=>n+(t||0),0);return s+a};if(o.useEffect(()=>{const r=j(i,a=>{h(a)}),s=w(i,a=>{const n=a.sort((t,f)=>x(f)-x(t));if(n.length>0){const t=n[0];l&&l.id!==t.id&&(u(`👑 Neuer Führender: ${t.name} 👑`),setTimeout(()=>u(null),5e3)),p(t)}c(n)});return()=>{s(),r&&r()}},[i]),!m)return e.jsx("div",{className:"app-root",style:{display:"flex",justifyContent:"center",alignItems:"center"},children:"Lade..."});const y=d.slice(0,3),b=d.slice(3);return e.jsxs("div",{className:"app-root",style:{height:"100vh",overflow:"hidden",padding:"2rem",display:"flex",flexDirection:"column"},children:[e.jsx(S,{eventData:m}),e.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(circle at 50% 50%, rgba(0, 255, 163, 0.05) 0%, transparent 70%)",zIndex:-1}}),e.jsxs("header",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3rem",borderBottom:"1px solid var(--glass-border)",paddingBottom:"1rem"},children:[e.jsxs("div",{children:[e.jsxs("h1",{style:{margin:0,fontSize:"3rem",textTransform:"uppercase",letterSpacing:"0.1em"},children:[e.jsx("span",{style:{color:"var(--accent-primary)"},children:"Live"})," Schießstand"]}),e.jsx("div",{style:{opacity:.6,fontSize:"1.2rem"},children:m.title})]}),e.jsx("div",{style:{textAlign:"right"},children:e.jsxs("div",{style:{fontSize:"1.5rem",fontWeight:"bold"},children:["Teilnehmer: ",d.length]})})]}),g&&e.jsx("div",{className:"glass",style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",zIndex:100,background:"rgba(0,0,0,0.9)",border:"2px solid var(--accent-primary)",padding:"3rem",fontSize:"3rem",fontWeight:"bold",color:"var(--accent-primary)",boxShadow:"0 0 100px rgba(29, 185, 84, 0.6)",borderRadius:"30px",textAlign:"center",minWidth:"600px",animation:"popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"},children:g}),e.jsxs("div",{className:"content-grid",style:{flex:1,overflow:"hidden"},children:[e.jsx("div",{className:"podium-container",children:y.map((r,s)=>{let a="var(--glass-border)",n=null;return s===0&&(a="#fbbf24",n="👑"),s===1&&(a="#94a3b8"),s===2&&(a="#b45309"),e.jsxs("div",{className:"glass podium-card",style:{display:"flex",alignItems:"center",padding:"1.5rem",border:`2px solid ${a}`,boxShadow:s===0?"0 0 30px rgba(251, 191, 36, 0.2)":"none",position:"relative",background:s===0?"rgba(251, 191, 36, 0.05)":"var(--glass-bg)"},children:[e.jsxs("div",{style:{fontSize:"2.5rem",fontWeight:"bold",color:a,width:"50px",display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center",gap:"5px"},children:[s+1,".",r.image&&e.jsx("img",{src:r.image,alt:r.name,style:{width:"50px",height:"50px",borderRadius:"50%",objectFit:"cover",border:`2px solid ${a}`}})]}),e.jsxs("div",{style:{flex:1,paddingLeft:"1.5rem",overflow:"hidden"},children:[e.jsxs("div",{className:"podium-name",children:[r.name," ",n]}),e.jsxs("div",{className:"podium-rounds",children:[e.jsxs("span",{children:["R1: ",e.jsx("strong",{children:(r.round1||[]).reduce((t,f)=>t+(f||0),0)})]}),e.jsxs("span",{children:["R2: ",e.jsx("strong",{children:(r.round2||[]).reduce((t,f)=>t+(f||0),0)})]})]})]}),e.jsx("div",{className:"podium-score",children:x(r)})]},r.id)})}),e.jsxs("div",{className:"glass list-container",style:{padding:"0",display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsx("div",{style:{padding:"1rem",borderBottom:"1px solid var(--glass-border)",fontSize:"1.1rem",fontWeight:"bold",background:"rgba(255,255,255,0.02)"},children:"Verfolgerfeld"}),e.jsx("div",{style:{overflowY:"auto",flex:1,padding:"1rem"},children:b.length===0?e.jsx("div",{style:{opacity:.3,textAlign:"center",marginTop:"1rem"},children:"Keine weiteren Teilnehmer."}):b.map((r,s)=>e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.8rem",marginBottom:"0.5rem",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:"1.1rem"},children:[e.jsxs("div",{style:{display:"flex",gap:"0.8rem",alignItems:"center"},children:[e.jsxs("span",{style:{opacity:.5,width:"25px"},children:[s+4,"."]}),r.image&&e.jsx("img",{src:r.image,alt:r.name,style:{width:"35px",height:"35px",borderRadius:"50%",objectFit:"cover"}}),e.jsx("strong",{children:r.name})]}),e.jsx("div",{style:{fontWeight:"bold",color:"var(--accent-secondary)"},children:x(r)})]},r.id))})]})]}),e.jsx("style",{children:`
                @keyframes popIn {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                
                /* DESKTOP LAYOUT (Default) */
                .content-grid {
                    display: grid; 
                    grid-template-columns: 1.2fr 0.8fr; 
                    gap: 3rem;
                }
                .podium-container {
                    display: flex; 
                    flex-direction: column; 
                    gap: 1rem; 
                    justify-content: center; 
                    padding-left: 1rem;
                }
                .podium-card {
                     /* Removed fixed transform scale to fix layout issues */
                     margin-left: 0;
                }
                .podium-name {
                    font-size: 2.5rem; 
                    font-weight: bold; 
                    line-height: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .podium-rounds {
                    display: flex; gap: 2rem; margin-top: 0.5rem; opacity: 0.7; font-size: 1.2rem;
                }
                .podium-score {
                     font-size: 4rem; fontWeight: bold; color: var(--accent-primary);
                }

                /* MOBILE LAYOUT */
                @media (max-width: 900px) {
                    .app-root {
                        padding: 1rem !important;
                    }
                    header {
                        margin-bottom: 1.5rem !important;
                    }
                    header h1 {
                        fontSize: 2rem !important;
                    }

                    .content-grid {
                        grid-template-columns: 1fr;
                        grid-template-rows: auto 1fr;
                        gap: 1.5rem;
                    }
                    
                    .podium-container {
                        padding-left: 0;
                    }
                    
                    .podium-card {
                        padding: 1rem !important;
                    }
                    .podium-name {
                        font-size: 1.5rem;
                    }
                    .podium-rounds {
                        font-size: 0.9rem;
                        gap: 1rem;
                    }
                    .podium-score {
                        font-size: 2.5rem;
                    }
                }
            `})]})}export{N as default};
