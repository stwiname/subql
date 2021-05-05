(self.webpackChunksubql_mono=self.webpackChunksubql_mono||[]).push([[535],{8465:(e,o,r)=>{"use strict";r.r(o),r.d(o,{data:()=>t});const t={key:"v-1258d9b6",path:"/publish/upgrade.html",title:"Deploy a New Version of your SubQuery Project",lang:"English",frontmatter:{},excerpt:"",headers:[{level:2,title:"Guidelines",slug:"guidelines",children:[]},{level:2,title:"Deploy Changes",slug:"deploy-changes",children:[{level:4,title:"Upgrade to the Latest Indexer and Query Service",slug:"upgrade-to-the-latest-indexer-and-query-service",children:[]},{level:4,title:"Deploy New Version of your SubQuery Project",slug:"deploy-new-version-of-your-subquery-project",children:[]}]},{level:2,title:"Next Steps",slug:"next-steps",children:[]}],filePathRelative:"publish/upgrade.md",git:{updatedTime:1620191309e3,contributors:[]}}},3139:(e,o,r)=>{"use strict";r.r(o),r.d(o,{default:()=>p});var t=r(6252);const n=(0,t.uE)('<h1 id="deploy-a-new-version-of-your-subquery-project"><a class="header-anchor" href="#deploy-a-new-version-of-your-subquery-project">#</a> Deploy a New Version of your SubQuery Project</h1><h2 id="guidelines"><a class="header-anchor" href="#guidelines">#</a> Guidelines</h2><p>Although you have the freedom to always upgrade and deploy new versions of your SubQuery project, please be considerate during this process if your SubQuery project is public for the world. Some key points to note:</p><ul><li>If your upgrade is a breaking change, either create a new project (e.g. <code>My SubQuery Project V2</code>) or give your community plenty of warning of the change through social media channels.</li><li>Deploying a new SubQuery project version causes some downtime as the new version indexes the complete chain from the genesis block.</li></ul><h2 id="deploy-changes"><a class="header-anchor" href="#deploy-changes">#</a> Deploy Changes</h2><p>Login to SubQuery Projects, and find the project that you want to deploy a new version to. Under Deployment Details you&#39;ll see three dots in the top right, click on the Deploy New Version button.</p><p><img src="/assets/img/projects-second-deployment.png" alt="Deploy new version to your Project"></p><h4 id="upgrade-to-the-latest-indexer-and-query-service"><a class="header-anchor" href="#upgrade-to-the-latest-indexer-and-query-service">#</a> Upgrade to the Latest Indexer and Query Service</h4>',8),a=(0,t.Uk)("If you just want to upgrade to the latest indexer ("),s={href:"https://www.npmjs.com/package/@subql/node",target:"_blank",rel:"noopener noreferrer"},u=(0,t.Wm)("code",null,"@subql/node",-1),l=(0,t.Uk)(") or query service ("),i={href:"https://www.npmjs.com/package/@subql/query",target:"_blank",rel:"noopener noreferrer"},h=(0,t.Wm)("code",null,"@subql/query",-1),d=(0,t.Uk)(") to take advantage of our regular performance and stability improvements, just select a newer versions of our packages and save. This will cause only a few minutes of downtime."),c=(0,t.uE)('<h4 id="deploy-new-version-of-your-subquery-project"><a class="header-anchor" href="#deploy-new-version-of-your-subquery-project">#</a> Deploy New Version of your SubQuery Project</h4><p>Fill in the Commit Hash from GitHub (copy the full commit hash) of the version of your SubQuery project codebase that you want deployed. This will cause longer downtime depending on the time it takes to index the current chain. You can always report back here for progress.</p><h2 id="next-steps"><a class="header-anchor" href="#next-steps">#</a> Next Steps</h2><p>Once your deployment has succeeded, connect to your updated SubQuery project in the SubQuery Explorer or via your GraphQL Endpoint. <a href="/publish/connect">Read how to here</a></p>',4),p={render:function(e,o){const r=(0,t.up)("OutboundLink");return(0,t.wg)(),(0,t.j4)(t.HY,null,[n,(0,t.Wm)("p",null,[a,(0,t.Wm)("a",s,[u,(0,t.Wm)(r)]),l,(0,t.Wm)("a",i,[h,(0,t.Wm)(r)]),d]),c],64)}}}}]);