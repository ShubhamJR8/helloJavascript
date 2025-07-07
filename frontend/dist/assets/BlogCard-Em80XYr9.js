import{a as o}from"./api-C0-4wgdu.js";import{r as i,j as s,L as p}from"./index-Cyoo_gxi.js";import{m as w}from"./proxy-4SvY_d_S.js";const D=async(e={})=>{try{return(await o.get("/blogs",{params:e})).data}catch(t){throw t}},I=async(e=6)=>{try{return(await o.get("/blogs/organized",{params:{limit:e}})).data}catch(t){throw t}},M=async e=>{try{return(await o.get(`/blogs/${e}`)).data}catch(t){throw t}},R=async()=>{try{return(await o.get("/blogs/categories")).data}catch(e){throw e}},F=async(e=5,t=null)=>{try{const r={limit:e};return t&&(r.topic=t),(await o.get("/blogs/featured",{params:r})).data}catch(r){throw r}},H=async(e,t=null,r=10)=>{try{const a={q:e,limit:r};return t&&(a.category=t),(await o.get("/blogs/search",{params:a})).data}catch(a){throw a}},P=async e=>{try{return(await o.post(`/blogs/${e}/like`)).data}catch(t){throw t}},S=async e=>{try{return(await o.post("/blogs",e)).data}catch(t){throw t}},Z=async(e,t)=>{try{return(await o.put(`/blogs/${e}`,t)).data}catch(r){throw r}},O=async e=>{try{return(await o.delete(`/blogs/${e}`)).data}catch(t){throw t}},T=async e=>{try{return(await o.patch(`/blogs/${e}/publish`)).data}catch(t){throw t}},q=async e=>{try{return(await o.patch(`/blogs/${e}/feature`)).data}catch(t){throw t}};/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),k=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,a)=>a?a.toUpperCase():r.toLowerCase()),g=e=>{const t=k(e);return t.charAt(0).toUpperCase()+t.slice(1)},x=(...e)=>e.filter((t,r,a)=>!!t&&t.trim()!==""&&a.indexOf(t)===r).join(" ").trim();/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var b={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=i.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:a,className:l="",children:c,iconNode:n,...h},m)=>i.createElement("svg",{ref:m,...b,width:t,height:t,stroke:e,strokeWidth:a?Number(r)*24/Number(t):r,className:x("lucide",l),...h},[...n.map(([u,y])=>i.createElement(u,y)),...Array.isArray(c)?c:[c]]));/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=(e,t)=>{const r=i.forwardRef(({className:a,...l},c)=>i.createElement(j,{ref:c,iconNode:t,className:x(`lucide-${f(g(e))}`,`lucide-${e}`,a),...l}));return r.displayName=g(e),r};/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]],N=d("clock",v);/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],C=d("eye",B);/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]],A=d("heart",$);/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],L=d("user",_),K=({blog:e,onLike:t,showActions:r=!0})=>{var c;const a=async n=>{n.preventDefault(),n.stopPropagation(),t&&await t(e._id)},l=n=>new Date(n).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"});return s.jsxs(w.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.3},className:"bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group",children:[e.coverImage&&s.jsxs("div",{className:"relative h-48 overflow-hidden",children:[s.jsx("img",{src:e.coverImage,alt:e.title,className:"w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"}),e.featured&&s.jsx("div",{className:"absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold",children:"Featured"})]}),s.jsxs("div",{className:"p-6",children:[s.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[s.jsx("span",{className:"px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium",children:e.category}),!e.published&&s.jsx("span",{className:"px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium",children:"Draft"})]}),s.jsx(p,{to:`/blog/${e.slug}`,className:"block",children:s.jsx("h3",{className:"text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2",children:e.title})}),s.jsx("p",{className:"text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3",children:e.excerpt}),s.jsxs("div",{className:"flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4",children:[s.jsxs("div",{className:"flex items-center gap-4",children:[s.jsxs("div",{className:"flex items-center gap-1",children:[s.jsx(L,{size:14}),s.jsx("span",{children:((c=e.author)==null?void 0:c.name)||"Unknown"})]}),s.jsxs("div",{className:"flex items-center gap-1",children:[s.jsx(N,{size:14}),s.jsxs("span",{children:[e.readTime," min read"]})]})]}),s.jsx("span",{children:l(e.publishedAt||e.createdAt)})]}),e.tags&&e.tags.length>0&&s.jsxs("div",{className:"flex flex-wrap gap-1 mb-4",children:[e.tags.slice(0,3).map(n=>s.jsxs("span",{className:"px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs",children:["#",n]},n)),e.tags.length>3&&s.jsxs("span",{className:"px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs",children:["+",e.tags.length-3]})]}),r&&s.jsxs("div",{className:"flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700",children:[s.jsxs("div",{className:"flex items-center gap-4",children:[s.jsxs("button",{onClick:a,className:"flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors",children:[s.jsx(A,{size:16}),s.jsx("span",{children:e.likes||0})]}),s.jsxs("div",{className:"flex items-center gap-1 text-gray-500 dark:text-gray-400",children:[s.jsx(C,{size:16}),s.jsx("span",{children:e.views||0})]})]}),s.jsx(p,{to:`/blog/${e.slug}`,className:"text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors",children:"Read More →"})]})]})]})};export{K as B,N as C,C as E,A as H,L as U,D as a,R as b,d as c,F as d,M as e,S as f,I as g,q as h,O as i,P as l,H as s,T as t,Z as u};
