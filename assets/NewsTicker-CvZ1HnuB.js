import{r,q as c,l as d,f as m,c as x,o as p,j as e,d as f}from"./index-BxSiqnys.js";function u(){const[t,n]=r.useState([]);return r.useEffect(()=>{const s=c(x(f,"guestbook_messages"),m("timestamp","desc"),d(20)),a=p(s,i=>{const o=i.docs.map(l=>l.data());n(o)});return()=>a()},[]),t.length===0?null:e.jsxs("div",{className:"fixed bottom-0 left-0 right-0 h-20 bg-black/90 backdrop-blur border-t-4 border-blue-500 z-50 flex items-center overflow-hidden pointer-events-none",children:[e.jsx("div",{className:"bg-blue-600 text-white font-black text-2xl px-6 h-full flex items-center z-10 shadow-xl shrink-0 tracking-wider",children:"GÄSTEBUCH"}),e.jsx("div",{className:"ticker-wrapper w-full flex items-center",children:e.jsx("div",{className:"ticker-content flex gap-16 px-4 text-2xl font-mono text-blue-100 whitespace-nowrap",children:[...t,...t].map((s,a)=>e.jsxs("span",{className:"flex items-center gap-4",children:[e.jsxs("span",{className:"font-bold text-cyan-400 uppercase drop-shadow-md",children:[s.name,":"]}),e.jsx("span",{className:"text-white drop-shadow-md",children:s.message}),e.jsx("span",{className:"text-blue-500 mx-4 text-3xl",children:"+++"})]},a))})}),e.jsx("style",{children:`
                .ticker-wrapper {
                    overflow: hidden;
                }
                .ticker-content {
                    animation: ticker 30s linear infinite;
                }
                /* Pause on hover (optional, but nice for reading) */
                /* .ticker-content:hover { animation-play-state: paused; } */

                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `})]})}export{u as N};
