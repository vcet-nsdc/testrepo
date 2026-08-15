"use client";

import { use, useEffect, useState } from "react";
import SchemaEditor from "../../SchemaEditor";
import type { IFormField } from "@/models/FormSchema";

interface Schema {
  _id: string;
  name: string;
  fields: IFormField[];
}

export default function EditSchemaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/form-schemas/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.data) setSchema(d.data); else setError(d.error?.message || "Not found"); })
      .catch(() => setError("Failed to load schema"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-3xl space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse" />
      ))}
    </div>
  );

  if (error || !schema) return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error || "Schema not found"}</div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-semibold text-lg">Edit Form Schema</h1>
        <p className="text-white/40 text-sm mt-0.5">Update fields for <span className="text-white/60">{schema.name}</span></p>
      </div>
      <SchemaEditor id={id} initialName={schema.name} initialFields={schema.fields} />
    </div>
  );
}
