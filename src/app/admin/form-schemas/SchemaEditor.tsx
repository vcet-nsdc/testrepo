"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronUp, ChevronDown, Loader2, ChevronRight } from "lucide-react";
import type { IFormField, FieldType } from "@/models/FormSchema";

const ic = "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all";
const TYPES: FieldType[] = ["text","email","phone","select","number","file","checkbox","textarea"];
interface BF extends Omit<IFormField,"key"> { key: string }
const blank = (): BF => ({ key:"", label:"", type:"text", required:false });

export default function SchemaEditor({ id, initialName="", initialFields=[] }: { id?:string; initialName?:string; initialFields?:IFormField[] }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [fields, setFields] = useState<BF[]>(initialFields);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<BF>(blank());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toKey = (l:string) => l.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"");
  const sd = <K extends keyof BF>(k:K,v:BF[K]) => setDraft(d=>({...d,[k]:v}));
  const move = (i:number,d:-1|1) => setFields(fs=>{ const a=[...fs]; const t=a[i] as BF; a[i]=a[i+d] as BF; a[i+d]=t; return a; });

  const addField = () => {
    if (!draft.label) return;
    setFields(fs=>[...fs,{...draft, key:draft.key||toKey(draft.label)}]);
    setDraft(blank()); setAdding(false);
  };

  const save = async () => {
    if (!name.trim()) { setError("Schema name is required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(id?`/api/admin/form-schemas/${id}`:"/api/admin/form-schemas",{
        method: id?"PATCH":"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({name:name.trim(), fields}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message||"Save failed");
      router.push("/admin/form-schemas");
    } catch(e) { setError(e instanceof Error?e.message:"Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {error && <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
        <label className="text-xs text-white/40 block mb-2">Schema Name *</label>
        <input className={ic} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Registration Form" />
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium text-sm">Fields ({fields.length})</span>
          <button onClick={()=>{setAdding(true);setDraft(blank());}} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/20 text-violet-300 transition-all">
            <Plus className="w-3.5 h-3.5" /> Add Field
          </button>
        </div>

        {fields.map((f,i)=>(
          <div key={i} className="group flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
            <div className="flex flex-col">
              <button onClick={()=>i>0&&move(i,-1)} disabled={i===0} className="text-white/20 hover:text-white/60 disabled:invisible"><ChevronUp className="w-3 h-3"/></button>
              <button onClick={()=>i<fields.length-1&&move(i,1)} disabled={i===fields.length-1} className="text-white/20 hover:text-white/60 disabled:invisible"><ChevronDown className="w-3 h-3"/></button>
            </div>
            <div className="flex-1 min-w-0 text-sm">
              <span className="text-white/80 font-medium">{f.label}</span>
              <span className="ml-2 text-white/30 text-xs font-mono">{f.key}</span>
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] text-white/40">{f.type}</span>
              {f.required&&<span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-300">req</span>}
              {f.type==="select"&&f.options?.length?<span className="ml-1 text-white/25 text-xs">[{f.options.join(", ")}]</span>:null}
            </div>
            <button onClick={()=>setFields(fs=>fs.filter((_,x)=>x!==i))} className="p-1.5 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5"/></button>
          </div>
        ))}

        {fields.length===0&&!adding&&<p className="text-center py-6 text-white/20 text-sm">No fields yet.</p>}

        {adding&&(
          <div className="border border-violet-500/20 rounded-xl p-4 space-y-3 bg-[#0d0d16]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-xs text-white/40 block mb-1">Label *</label>
                <input className={ic} value={draft.label} placeholder="Full Name" onChange={e=>{sd("label",e.target.value);if(!draft.key)sd("key",toKey(e.target.value));}}/></div>
              <div><label className="text-xs text-white/40 block mb-1">Key</label>
                <input className={ic} value={draft.key} placeholder="full_name" onChange={e=>sd("key",e.target.value)}/></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-xs text-white/40 block mb-1">Type</label>
                <select className={ic} value={draft.type} onChange={e=>sd("type",e.target.value as FieldType)}>
                  {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </select></div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                  <input type="checkbox" checked={draft.required} onChange={e=>sd("required",e.target.checked)}/> Required
                </label>
              </div>
            </div>
            {draft.type==="select"&&(
              <div><label className="text-xs text-white/40 block mb-1">Options (one per line)</label>
                <textarea className={ic} rows={3} value={draft.options?.join("\n")??""}
                  onChange={e=>sd("options",e.target.value.split("\n"))}/></div>
            )}
            <details><summary className="flex items-center gap-1 text-xs text-white/30 cursor-pointer hover:text-white/50 list-none select-none">
              <ChevronRight className="w-3 h-3"/> Advanced (conditional)
            </summary>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div><label className="text-xs text-white/40 block mb-1">Show when field</label>
                  <input className={ic} value={draft.conditional?.fieldKey??""} placeholder="field_key"
                    onChange={e=>sd("conditional",{fieldKey:e.target.value,equals:draft.conditional?.equals??""})} /></div>
                <div><label className="text-xs text-white/40 block mb-1">equals</label>
                  <input className={ic} value={draft.conditional?.equals??""} placeholder="value"
                    onChange={e=>sd("conditional",{fieldKey:draft.conditional?.fieldKey??"",equals:e.target.value})} /></div>
              </div>
            </details>
            <div className="flex gap-2 pt-1">
              <button onClick={addField} className="px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 text-sm transition-all">Add</button>
              <button onClick={()=>setAdding(false)} className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 text-sm transition-all">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 text-sm transition-all disabled:opacity-50">
          {saving&&<Loader2 className="w-4 h-4 animate-spin"/>} {id?"Save Changes":"Create Schema"}
        </button>
        <button onClick={()=>router.push("/admin/form-schemas")} className="px-5 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 text-sm transition-all">Cancel</button>
      </div>
    </div>
  );
}
