import SchemaEditor from "../SchemaEditor";

export default function NewSchemaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white font-semibold text-lg">New Form Schema</h1>
        <p className="text-white/40 text-sm mt-0.5">Define the fields for your dynamic form</p>
      </div>
      <SchemaEditor />
    </div>
  );
}
