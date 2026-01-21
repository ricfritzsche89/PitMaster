import{r as o,j as e,u as S}from"./index-B-gWLAB0.js";import{s as I,f as z}from"./db-B064TZVF.js";function E({eventData:s}){const[g,d]=o.useState(!1),[f,b]=o.useState(Date.now());return o.useEffect(()=>{const l=setInterval(()=>b(Date.now()),1e3);return()=>clearInterval(l)},[]),o.useEffect(()=>{if(s?.broadcast?.overlay?.active){const{timestamp:l,duration:c,permanent:x}=s.broadcast.overlay;x||Date.now()-l<c*1e3?d(!0):d(!1)}else d(!1)},[s?.broadcast?.overlay,f]),e.jsxs(e.Fragment,{children:[g&&s?.broadcast?.overlay&&e.jsx("div",{style:{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",background:"rgba(0,0,0,0.9)",animation:"fadeIn 0.3s ease-out"},children:e.jsx("div",{className:"glass",style:{padding:"4rem",border:"4px solid var(--accent-danger)",borderRadius:"24px",background:"rgba(239, 68, 68, 0.1)",boxShadow:"0 0 50px rgba(220, 38, 38, 0.5)",textAlign:"center",maxWidth:"90vw",willChange:"transform, opacity",animation:"popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"},children:e.jsx("h1",{className:"text-gradient",style:{fontSize:"5rem",margin:0,textTransform:"uppercase",color:"white",textShadow:"0 0 20px var(--accent-danger)",lineHeight:1.2},children:s.broadcast.overlay.message})})}),s?.broadcast?.ticker?.active&&e.jsxs("div",{style:{position:"fixed",bottom:0,left:0,width:"100%",background:"rgba(2, 6, 23, 0.95)",borderTop:"2px solid var(--accent-primary)",color:"white",padding:"1.5rem 0",zIndex:9998,overflow:"hidden",boxShadow:"0 -5px 20px rgba(0,0,0,0.5)"},children:[e.jsx("div",{style:{display:"inline-block",whiteSpace:"nowrap",animation:`marquee ${Math.max(5,45-(s.broadcast.ticker.speed||5)*4)}s linear infinite`,fontSize:"2rem",fontWeight:"800",textTransform:"uppercase",color:"var(--accent-primary)",textShadow:"0 0 10px rgba(29, 185, 84, 0.3)",letterSpacing:"2px",willChange:"transform"},children:[...Array(6)].map((l,c)=>e.jsxs("span",{children:[s.broadcast.ticker.message,"   •  "]},c))}),e.jsx("style",{children:`
                        @keyframes marquee {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); } 
                        }
                        @keyframes popIn {
                            from { transform: scale(0.5); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `})]})]})}function R(){const{eventId:s}=S(),[g,d]=o.useState([]),[f,b]=o.useState(null),[l,c]=o.useState(null),[x,y]=o.useState(null),[m,v]=o.useState(!1),u=o.useRef(null);o.useEffect(()=>{let t=null;return m&&navigator.mediaDevices.getUserMedia({video:!0}).then(r=>{t=r,u.current&&(u.current.srcObject=t,u.current.play())}).catch(r=>{console.error("Camera error:",r),alert("Kamera konnte nicht gestartet werden: "+r.message),v(!1)}),()=>{t&&t.getTracks().forEach(r=>r.stop())}},[m]);const h=t=>{const r=(t.round1||[]).reduce((n,i)=>n+(i||0),0),a=(t.round2||[]).reduce((n,i)=>n+(i||0),0);return r+a};if(o.useEffect(()=>{const t=I(s,a=>{b(a)}),r=z(s,a=>{const n=a.sort((i,p)=>h(p)-h(i));if(n.length>0){const i=n[0];l&&l.id!==i.id&&(y(`👑 Neuer Führender: ${i.name} 👑`),setTimeout(()=>y(null),5e3)),c(i)}d(n)});return()=>{r(),t&&t()}},[s]),!f)return e.jsx("div",{className:"app-root",style:{display:"flex",justifyContent:"center",alignItems:"center"},children:"Lade..."});const w=g.slice(0,3),j=g.slice(3);return e.jsxs("div",{className:"app-root",style:{height:"100vh",overflow:"hidden",padding:"2rem",display:"flex",flexDirection:"column"},children:[e.jsx(E,{eventData:f}),e.jsx("div",{style:{position:"absolute",top:0,left:0,right:0,bottom:0,background:"radial-gradient(circle at 50% 50%, rgba(0, 255, 163, 0.05) 0%, transparent 70%)",zIndex:-1}}),e.jsx("header",{style:{position:"absolute",top:"1rem",right:"1rem",zIndex:100},children:e.jsx("button",{onClick:()=>v(!m),className:"btn-ghost",style:{fontSize:"1rem",padding:"8px 16px",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(5px)"},title:"Kamera für Zielscheibe umschalten",children:m?"⏹️":"📹"})}),x&&e.jsx("div",{className:"glass",style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",zIndex:100,background:"rgba(0,0,0,0.9)",border:"2px solid var(--accent-primary)",padding:"3rem",fontSize:"3rem",fontWeight:"bold",color:"var(--accent-primary)",boxShadow:"0 0 100px rgba(29, 185, 84, 0.6)",borderRadius:"30px",textAlign:"center",minWidth:"600px",animation:"popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"},children:x}),e.jsxs("div",{className:"content-grid",style:{flex:1,overflow:"hidden",marginTop:"1rem"},children:[e.jsx("div",{className:"podium-container",children:w.map((t,r)=>{let a="var(--glass-border)",n=null;return r===0&&(a="#fbbf24",n="👑"),r===1&&(a="#94a3b8"),r===2&&(a="#b45309"),e.jsxs("div",{className:"glass podium-card",style:{display:"grid",gridTemplateColumns:"auto 1fr auto",alignItems:"center",gap:"2rem",padding:"1rem 2rem",border:`2px solid ${a}`,boxShadow:r===0?"0 0 40px rgba(251, 191, 36, 0.3)":"none",position:"relative",background:r===0?"rgba(251, 191, 36, 0.1)":"var(--glass-bg)"},children:[e.jsxs("div",{style:{fontSize:"3rem",fontWeight:"bold",color:a,width:"60px",textAlign:"center"},children:[r+1,"."]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"2rem"},children:[t.image?e.jsx("img",{src:t.image,alt:t.name,style:{width:"120px",height:"120px",borderRadius:"50%",objectFit:"cover",border:`4px solid ${a}`,boxShadow:`0 0 20px ${a}`}}):e.jsx("div",{style:{width:"120px",height:"120px",borderRadius:"50%",border:`4px solid ${a}`,background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"3rem"},children:"👤"}),e.jsxs("div",{style:{flex:1},children:[e.jsxs("div",{className:"podium-name",style:{fontSize:"3.5rem",lineHeight:"1.2"},children:[t.name," ",n]}),e.jsxs("div",{className:"podium-rounds",children:[e.jsxs("span",{children:["R1: ",e.jsx("strong",{children:(t.round1||[]).reduce((i,p)=>i+(p||0),0)})]}),e.jsxs("span",{children:["R2: ",e.jsx("strong",{children:(t.round2||[]).reduce((i,p)=>i+(p||0),0)})]})]})]})]}),e.jsx("div",{className:"podium-score",children:h(t)})]},t.id)})}),e.jsxs("div",{className:"glass list-container",style:{padding:"0",display:"flex",flexDirection:"column",overflow:"hidden"},children:[e.jsx("div",{style:{padding:"1rem",borderBottom:"1px solid var(--glass-border)",fontSize:"1.1rem",fontWeight:"bold",background:"rgba(255,255,255,0.02)"},children:"Verfolgerfeld"}),e.jsx("div",{style:{overflowY:"auto",flex:1,padding:"1rem"},children:j.length===0?e.jsx("div",{style:{opacity:.3,textAlign:"center",marginTop:"1rem"},children:"Keine weiteren Teilnehmer."}):j.map((t,r)=>e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.8rem",marginBottom:"0.5rem",borderBottom:"1px solid rgba(255,255,255,0.05)",fontSize:"1.1rem"},children:[e.jsxs("div",{style:{display:"flex",gap:"0.8rem",alignItems:"center"},children:[e.jsxs("span",{style:{opacity:.5,width:"25px"},children:[r+4,"."]}),t.image&&e.jsx("img",{src:t.image,alt:t.name,style:{width:"40px",height:"40px",borderRadius:"50%",objectFit:"cover"}}),e.jsx("strong",{children:t.name})]}),e.jsx("div",{style:{fontWeight:"bold",color:"var(--accent-secondary)"},children:h(t)})]},t.id))})]})]}),m&&e.jsxs("div",{className:"glass",style:{position:"absolute",bottom:"2rem",right:"2rem",width:"320px",height:"240px",padding:"0",border:"2px solid var(--accent-primary)",boxShadow:"0 0 30px rgba(0,0,0,0.8)",zIndex:50,overflow:"hidden",display:"flex",flexDirection:"column"},children:[e.jsx("div",{style:{padding:"5px 10px",background:"rgba(0,0,0,0.7)",fontSize:"0.8rem",fontWeight:"bold",color:"var(--accent-primary)",display:"flex",justifyContent:"space-between",position:"absolute",top:0,left:0,right:0,zIndex:10},children:e.jsx("span",{children:"🔴 LIVE ZIEL"})}),e.jsx("video",{ref:u,style:{width:"100%",height:"100%",objectFit:"cover"},muted:!0})]}),e.jsx("style",{children:`
                @keyframes popIn {
                    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                
                /* DESKTOP LAYOUT (Default) */
                .content-grid {
                    display: grid; 
                    grid-template-columns: 1.5fr 0.8fr; 
                    gap: 3rem;
                }
                .podium-container {
                    display: flex; 
                    flex-direction: column; 
                    gap: 1.5rem; 
                    justify-content: center; 
                    padding-left: 1rem;
                }
                .podium-card {
                     /* Removed fixed transform scale to fix layout issues */
                     margin-left: 0;
                }
                .podium-name {
                    font-weight: bold; 
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .podium-rounds {
                    display: flex; gap: 2rem; margin-top: 0.5rem; opacity: 0.7; font-size: 1.5rem;
                }
                .podium-score {
                     font-size: 5rem; fontWeight: bold; color: var(--accent-primary);
                }

                /* HIDE HEADER ELEMENTS IF NEEDED */
                
                /* TICKER OVERRIDES (Injecting CSS to override global styles) */
                .ticker-container {
                    font-size: 80% !important; /* Reduce size */
                }

                /* MOBILE LAYOUT */
                @media (max-width: 900px) {
                    .app-root {
                        padding: 1rem !important;
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
                        grid-template-columns: auto 1fr auto !important;
                        gap: 1rem !important;
                    }
                    .podium-name {
                        font-size: 1.5rem !important;
                    }
                    .podium-rounds {
                        font-size: 0.9rem !important;
                        gap: 1rem !important;
                    }
                    .podium-score {
                        font-size: 2.5rem !important;
                    }
                }
            `})]})}export{R as default};
