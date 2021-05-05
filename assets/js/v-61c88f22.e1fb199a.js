(self.webpackChunksubql_mono=self.webpackChunksubql_mono||[]).push([[494],{8426:(e,t,o)=>{"use strict";o.r(t),o.d(t,{data:()=>n});const n={key:"v-61c88f22",path:"/run/sandbox.html",title:"The Sandbox",lang:"English",frontmatter:{},excerpt:"",headers:[{level:2,title:"Restriction",slug:"restriction",children:[]}],filePathRelative:"run/sandbox.md",git:{updatedTime:1620191309e3,contributors:[]}}},5924:(e,t,o)=>{"use strict";o.r(t),o.d(t,{default:()=>u});var n=o(6252);const s=(0,n.Wm)("h1",{id:"the-sandbox"},[(0,n.Wm)("a",{class:"header-anchor",href:"#the-sandbox"},"#"),(0,n.Uk)(" The Sandbox")],-1),a=(0,n.Wm)("p",null,"In our envisioned usage scenario, the SubQuery node is usually run by a trusted host, and the code of the SubQuery project submitted by the user to the node is not entirely trustworthy.",-1),r=(0,n.Uk)("Some malicious code is likely to attack the host or even compromise it, and cause damage to the data of other projects in the same host. Therefore, we use the "),i={href:"https://www.npmjs.com/package/vm2",target:"_blank",rel:"noopener noreferrer"},d=(0,n.Uk)("VM2"),l=(0,n.Uk)(" sandbox secured mechanism to reduce risks."),c=(0,n.uE)('<ul><li><p>Runs untrusted code securely in an isolated context, and malicious code will not access network and file system of the host, unless through the exposed interface we injected into the sandbox.</p></li><li><p>Securely call methods and exchange data and callbacks between sandboxes</p></li><li><p>Is immune to all known methods of attacks</p></li></ul><h2 id="restriction"><a class="header-anchor" href="#restriction">#</a> Restriction</h2><ul><li><p>Limit access to certain built-in modules, only <code>assert</code> and <code>console</code> are whitelisted.</p></li><li><p>Any 3rd party module are forbid. When defining a SubQuery project, we do not support users to add any new dependencies to <code>package.json</code>, thereby protecting the project&#39;s stability and the security in the sandbox.</p></li></ul>',3),u={render:function(e,t){const o=(0,n.up)("OutboundLink");return(0,n.wg)(),(0,n.j4)(n.HY,null,[s,a,(0,n.Wm)("p",null,[r,(0,n.Wm)("a",i,[d,(0,n.Wm)(o)]),l]),c],64)}}}}]);