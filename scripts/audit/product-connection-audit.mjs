import fs from "fs";
import path from "path";
const ROOT = process.cwd();
const TARGETS = ["src/app", "src/components"];
const patterns = [
  { name: "button_without_action", re: /<button(?![^>]*(onClick|type="submit"|type='submit'|disabled|aria-label="Cerrar|aria-label="Close))[^>]*>/g },
  { name: "href_hash", re: /href=["']#["']/g },
  { name: "decorative_action_text", re: /Guardar vista|Exportar|Más opciones|Ver todas|Filtros|Personalizar/g },
  { name: "coming_soon_or_placeholder", re: /Próximamente|proximamente|placeholder|mock|demo/g },
  { name: "local_only_state", re: /localStorage|defaultItems/g },
];
function walk(dir){ if(!fs.existsSync(dir)) return []; return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{ const f=path.join(dir,e.name); if(e.isDirectory()) return walk(f); return /\.(tsx|ts|jsx|js)$/.test(f)?[f]:[]; }); }
const results=[];
for(const file of TARGETS.flatMap(t=>walk(path.join(ROOT,t)))){
 const content=fs.readFileSync(file,'utf8');
 for(const pattern of patterns){ const count=[...content.matchAll(pattern.re)].length; if(count) results.push({file:path.relative(ROOT,file),issue:pattern.name,count}); }
}
console.table(results);
fs.mkdirSync('docs/audits', { recursive: true });
fs.writeFileSync('docs/audits/product-connection-audit.json', JSON.stringify(results,null,2));
