import{r,j as e}from"./index-MD-oR1BA.js";import{q as l,l as m,b as d,c as x,o as p,d as f}from"./firebase-2h90pOvg.js";function b(){const[t,n]=r.useState([]);return r.useEffect(()=>{const s=l(x(f,"guestbook_messages"),d("timestamp","desc"),m(20)),a=p(s,i=>{const o=i.docs.map(c=>c.data());n(o)});return()=>a()},[]),t.length===0?null:e.jsxs("div",{className:"fixed bottom-0 left-0 right-0 h-10 bg-black/80 backdrop-blur border-t-2 border-blue-500 z-50 flex items-center overflow-hidden pointer-events-none",children:[e.jsx("div",{className:"bg-blue-600 text-white font-black text-xs px-3 h-full flex items-center z-10 shadow-xl shrink-0",children:"GÄSTEBUCH"}),e.jsx("div",{className:"ticker-wrapper w-full flex items-center",children:e.jsx("div",{className:"ticker-content flex gap-8 px-4 text-sm font-mono text-blue-100 whitespace-nowrap",children:[...t,...t].map((s,a)=>e.jsxs("span",{className:"flex items-center gap-2",children:[e.jsxs("span",{className:"font-bold text-cyan-400 uppercase",children:[s.name,":"]}),e.jsx("span",{className:"text-white",children:s.message}),e.jsx("span",{className:"text-blue-500 mx-2",children:"+++"})]},a))})}),e.jsx("style",{children:`
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
            `})]})}export{b as N};
