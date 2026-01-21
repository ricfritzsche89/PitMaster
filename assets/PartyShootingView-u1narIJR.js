import{r as n,j as e,u as S}from"./index-CuTtOCa5.js";import{s as z,f as I}from"./db-B7zd0tQ0.js";function k({eventData:a}){const[d,c]=n.useState(!1),[m,b]=n.useState(Date.now());return n.useEffect(()=>{const l=setInterval(()=>b(Date.now()),1e3);return()=>clearInterval(l)},[]),n.useEffect(()=>{if(a?.broadcast?.overlay?.active){const{timestamp:l,duration:p,permanent:x}=a.broadcast.overlay;x||Date.now()-l<p*1e3?c(!0):c(!1)}else c(!1)},[a?.broadcast?.overlay,m]),e.jsxs(e.Fragment,{children:[d&&a?.broadcast?.overlay&&e.jsx("div",{style:{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",background:"rgba(0,0,0,0.9)",animation:"fadeIn 0.3s ease-out"},children:e.jsx("div",{className:"glass",style:{padding:"4rem",border:"4px solid var(--accent-danger)",borderRadius:"24px",background:"rgba(239, 68, 68, 0.1)",boxShadow:"0 0 50px rgba(220, 38, 38, 0.5)",textAlign:"center",maxWidth:"90vw",willChange:"transform, opacity",animation:"popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"},children:e.jsx("h1",{className:"text-gradient",style:{fontSize:"5rem",margin:0,textTransform:"uppercase",color:"white",textShadow:"0 0 20px var(--accent-danger)",lineHeight:1.2},children:a.broadcast.overlay.message})})}),a?.broadcast?.ticker?.active&&e.jsxs("div",{style:{position:"fixed",bottom:0,left:0,width:"100%",background:"rgba(2, 6, 23, 0.95)",borderTop:"2px solid var(--accent-primary)",color:"white",padding:"1.5rem 0",zIndex:9998,overflow:"hidden",boxShadow:"0 -5px 20px rgba(0,0,0,0.5)"},children:[e.jsx("div",{style:{display:"inline-block",whiteSpace:"nowrap",animation:`marquee ${Math.max(5,45-(a.broadcast.ticker.speed||5)*4)}s linear infinite`,fontSize:"2.5rem",fontWeight:"800",textTransform:"uppercase",color:"var(--accent-primary)",textShadow:"0 0 10px rgba(29, 185, 84, 0.3)",letterSpacing:"2px",willChange:"transform"},children:[...Array(6)].map((l,p)=>e.jsxs("span",{children:[a.broadcast.ticker.message,"   •  "]},p))}),e.jsx("style",{children:`
                        @keyframes marquee {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); } 
                        }
                        @keyframes popIn {
                            from { transform: scale(0.5); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `})]})]})}function T(){const{eventId:a}=S(),[d,c]=n.useState([]),[m,b]=n.useState(null),[l,p]=n.useState(null),[x,y]=n.useState(null),[f,v]=n.useState(!1),h=n.useRef(null);n.useEffect(()=>{let t=null;return f&&navigator.mediaDevices.getUserMedia({video:!0}).then(r=>{t=r,h.current&&(h.current.srcObject=t,h.current.play())}).catch(r=>{console.error("Camera error:",r),alert("Kamera konnte nicht gestartet werden: "+r.message),v(!1)}),()=>{t&&t.getTracks().forEach(r=>r.stop())}},[f]);const u=t=>{const r=(t.round1||[]).reduce((o,i)=>o+(i||0),0),s=(t.round2||[]).reduce((o,i)=>o+(i||0),0);return r+s};if(n.useEffect(()=>{const t=z(a,s=>{b(s)}),r=I(a,s=>{const o=s.sort((i,g)=>u(g)-u(i));if(o.length>0){const i=o[0];l&&l.id!==i.id&&(y(`👑 Neuer Führender: ${i.name} 👑`),setTimeout(()=>y(null),5e3)),p(i)}c(o)});return()=>{r(),t&&t()}},[a]),!m)return e.jsx("div",{className:"app-root",style:{display:"flex",justifyContent:"center",alignItems:"center"},children:"Lade..."});const w=d.slice(0,3),j=d.slice(3);return e.jsxs("div",{className:"app-root",style:{height:"100vh",overflow:"hidden",padding:"2rem",display:"flex",flexDirection:"column"},children:[e.jsx(k,{eventData:m}),e.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(circle at 50% 50%, rgba(0, 255, 163, 0.05) 0%, transparent 70%)",zIndex:-1}}),e.jsxs("header",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"3rem",borderBottom:"1px solid var(--glass-border)",paddingBottom:"1rem"},children:[e.jsxs("div",{children:[e.jsxs("h1",{style:{margin:0,fontSize:"3rem",textTransform:"uppercase",letterSpacing:"0.1em"},children:[e.jsx("span",{style:{color:"var(--accent-primary)"},children:"Live"})," Schießstand"]}),e.jsx("div",{style:{opacity:.6,fontSize:"1.2rem"},children:m.title})]}),e.jsxs("div",{style:{textAlign:"right",display:"flex",alignItems:"center",gap:"2rem"},children:[e.jsx("button",{onClick:()=>v(!f),className:"btn-ghost",style:{fontSize:"1.5rem",padding:"10px"},title:"Kamera für Zielscheibe umschalten",children:f?"⏹️ Cam Aus":"📹 Cam Ein"}),e.jsxs("div",{style:{fontSize:"1.5rem",fontWeight:"bold"},children:["Teilnehmer: ",d.length]})]})]}),x&&e.jsx("div",{className:"glass",style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",zIndex:100,background:"rgba(0,0,0,0.9)",border:"2px solid var(--accent-primary)",padding:"3rem",fontSize:"3rem",fontWeight:"bold",color:"var(--accent-primary)",boxShadow:"0 0 100px rgba(29, 185, 84, 0.6)",borderRadius:"30px",textAlign:"center",minWidth:"600px",animation:"popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"},children:x}),e.jsxs("div",{className:"content-grid",style:{flex:1,overflow:"hidden"},children:[e.jsx("div",{className:"podium-container",children:w.map((t,r)=>{let s="var(--glass-border)",o=null;return r===0&&(s="#fbbf24",o="👑"),r===1&&(s="#94a3b8"),r===2&&(s="#b45309"),e.jsxs("div",{className:"glass podium-card",style:{display:"flex",alignItems:"center",padding:"1.5rem",border:`2px solid ${s}`,boxShadow:r===0?"0 0 30px rgba(251, 191, 36, 0.2)":"none",position:"relative",background:r===0?"rgba(251, 191, 36, 0.05)":"var(--glass-bg)"},children:[e.jsxs("div",{style:{fontSize:"2.5rem",fontWeight:"bold",color:s,width:"50px",display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center",gap:"5px"},children:[r+1,".",t.image&&e.jsx("img",{src:t.image,alt:t.name,style:{width:"50px",height:"50px",borderRadius:"50%",objectFit:"cover",border:`2px solid ${s}`}})]}),e.jsxs("div",{style:{flex:1,paddingLeft:"1.5rem",overflow:"hidden"},children:[e.jsxs("div",{className:"podium-name",children:[t.name," ",o]}),e.jsxs("div",{className:"podium-rounds",children:[e.jsxs("span",{children:["R1: ",e.jsx("strong",{children:(t.round1||[]).reduce((i,g)=>i+(g||0),0)})]}),e.jsxs("span",{children:["R2: ",e.jsx("strong",{children:(t.round2||[]).reduce((i,g)=>i+(g||0),0)})]})]})]}),e.jsxs("div",{className:"podium-score",children:[u(t),f&&e.jsxs("div",{className:"glass",style:{position:"absolute",bottom:"2rem",right:"2rem",width:"320px",height:"240px",padding:"0",border:"2px solid var(--accent-primary)",boxShadow:"0 0 30px rgba(0,0,0,0.5)",zIndex:50,overflow:"hidden",display:"flex",flexDirection:"column"},children:[e.jsx("div",{style:{padding:"5px 10px",background:"rgba(0,0,0,0.5)",fontSize:"0.8rem",fontWeight:"bold",color:"var(--accent-primary)",display:"flex",justifyContent:"space-between"},children:e.jsx("span",{children:"🔴 LIVE ZIEL"})}),e.jsx("video",{ref:h,style:{width:"100%",height:"100%",objectFit:"cover"},muted:!0})]})]})]},t.id)})}),e.jsxs("div",{className:"glass list-container",style:{padding:"0",display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsx("div",{style:{padding:"1rem",borderBottom:"1px solid var(--glass-border)",fontSize:"1.1rem",fontWeight:"bold",background:"rgba(255,255,255,0.02)"},children:"Verfolgerfeld"}),e.jsx("div",{style:{overflowY:"auto",flex:1,padding:"1rem"},children:j.length===0?e.jsx("div",{style:{opacity:.3,textAlign:"center",marginTop:"1rem"},children:"Keine weiteren Teilnehmer."}):j.map((t,r)=>e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.8rem",marginBottom:"0.5rem",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:"1.1rem"},children:[e.jsxs("div",{style:{display:"flex",gap:"0.8rem",alignItems:"center"},children:[e.jsxs("span",{style:{opacity:.5,width:"25px"},children:[r+4,"."]}),t.image&&e.jsx("img",{src:t.image,alt:t.name,style:{width:"35px",height:"35px",borderRadius:"50%",objectFit:"cover"}}),e.jsx("strong",{children:t.name})]}),e.jsx("div",{style:{fontWeight:"bold",color:"var(--accent-secondary)"},children:u(t)})]},t.id))})]})]}),e.jsx("style",{children:`
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
            `})]})}export{T as default};
