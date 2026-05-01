"use client";

import { useMemo, useState, type ComponentProps, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Plus, Search, ShieldAlert, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string };
type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "email" | "password" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: Option[];
  hideOnEdit?: boolean;
  hideOnCreate?: boolean;
  span?: "full" | "half";
};
type Column = { key: string; label: string; render?: (row: any) => ReactNode; className?: string };
type Props = {
  title: string;
  description?: string;
  endpoint: string;
  rows: any[];
  fields: Field[];
  columns: Column[];
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  createLabel?: string;
  deleteLabel?: string;
  deleteVerb?: string;
  emptyState?: string;
  submitShape?: "invoice" | "purchase";
};

function valueFor(row: any, key: string) {
  const value = row?.[key];
  if (value === null || value === undefined) return "";
  return value;
}

function defaultForm(fields: Field[], row?: any) {
  return fields.reduce<Record<string, any>>((acc, field) => {
    acc[field.key] = row ? valueFor(row, field.key) : "";
    return acc;
  }, {});
}

function normalizeByFields(form: Record<string, any>, fields: Field[]) {
  const payload: Record<string, any> = {};
  for (const field of fields) {
    const value = form[field.key];
    payload[field.key] = field.type === "number" ? (value === "" || value === null || value === undefined ? 0 : Number(value)) : value === "" ? undefined : value;
  }
  return payload;
}

function statusVariant(value: string): ComponentProps<typeof Badge>["variant"] {
  const normalized = value.toLowerCase();
  if (["active", "paid", "completed"].includes(normalized)) return "success";
  if (["partial", "draft", "pending"].includes(normalized)) return "warning";
  if (["cancelled", "archived", "inactive"].includes(normalized)) return "destructive";
  return "outline";
}

function cellContent(column: Column, row: any) {
  if (column.render) return column.render(row);
  const value = valueFor(row, column.key);
  if (!value) return "-";
  if (column.key.toLowerCase().includes("status")) {
    return <Badge variant={statusVariant(String(value))}>{String(value).toLowerCase()}</Badge>;
  }
  return String(value);
}

function rowLabel(row: any) {
  return row.name || row.invoiceNo || row.purchaseNo || row.paymentNo || row.email || "this record";
}

export function CrudManager({
  title,
  description,
  endpoint,
  rows,
  fields,
  columns,
  canCreate,
  canUpdate,
  canDelete,
  createLabel = "Add record",
  deleteLabel = "Delete",
  deleteVerb = deleteLabel,
  emptyState = "No records found.",
  submitShape
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed");
  const [activeRow, setActiveRow] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>(defaultForm(fields));
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const activeFields = useMemo(() => fields.filter((field) => (mode === "edit" ? !field.hideOnEdit : !field.hideOnCreate)), [fields, mode]);
  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      columns.some((column) => String(valueFor(row, column.key)).toLowerCase().includes(normalized))
    );
  }, [columns, query, rows]);

  function openCreate() {
    setActiveRow(null);
    setForm(defaultForm(fields));
    setMessage(null);
    setMode("create");
  }

  function openEdit(row: any) {
    setActiveRow(row);
    setForm(defaultForm(fields, row));
    setMessage(null);
    setMode("edit");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const method = mode === "edit" ? "PATCH" : "POST";
      const url = mode === "edit" ? `${endpoint}/${activeRow.id}` : endpoint;
      const basePayload = normalizeByFields(form, activeFields);
      const payload =
        submitShape === "invoice" && mode === "create"
          ? {
              invoiceNo: basePayload.invoiceNo,
              customerId: basePayload.customerId,
              discount: basePayload.discount,
              tax: basePayload.tax,
              paidAmount: basePayload.paidAmount,
              notes: basePayload.notes,
              items: [{ productId: basePayload.productId, quantity: basePayload.quantity || 1, ...(basePayload.unitPrice ? { unitPrice: basePayload.unitPrice } : {}) }]
            }
          : submitShape === "purchase" && mode === "create"
            ? {
                purchaseNo: basePayload.purchaseNo,
                supplierId: basePayload.supplierId,
                paidAmount: basePayload.paidAmount,
                notes: basePayload.notes,
                items: [{ productId: basePayload.productId, quantity: basePayload.quantity || 1, unitCost: basePayload.unitCost }]
              }
            : basePayload;
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Request failed.");
      setMode("closed");
      router.refresh();
    } catch (error: any) {
      setMessage(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(row: any) {
    if (!window.confirm(`${deleteVerb} ${rowLabel(row)}?`)) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${endpoint}/${row.id}`, { method: "DELETE", cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Request failed.");
      router.refresh();
    } catch (error: any) {
      setMessage(error?.message || "Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="crud-card overflow-hidden">
      <CardHeader className="crud-header">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{rows.length.toLocaleString()} records</Badge>
              {canCreate || canUpdate || canDelete ? <Badge variant="success">Role enabled</Badge> : <Badge variant="outline">Read only</Badge>}
            </div>
            <CardTitle className="text-xl tracking-normal">{title}</CardTitle>
            {description ? <CardDescription className="max-w-3xl">{description}</CardDescription> : null}
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
            <div className="relative min-w-0 flex-1 xl:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 pl-10" placeholder={`Search ${title.toLowerCase()}...`} />
            </div>
            {canCreate ? (
              <Button onClick={openCreate} className="shrink-0">
                <Plus className="size-4" />
                {createLabel}
              </Button>
            ) : canUpdate || canDelete ? (
              <Badge variant="secondary" className="min-h-10 px-4">Existing records only</Badge>
            ) : (
              <Badge variant="outline" className="min-h-10 px-4">
                <ShieldAlert className="size-3.5" /> Read-only for your role
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {message ? <div className="status-message mx-4 mt-4 border-destructive/20 bg-destructive/10 text-destructive sm:mx-5">{message}</div> : null}
        {mode !== "closed" ? (
          <form onSubmit={submit} className="crud-form-panel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{mode === "edit" ? `Update ${rowLabel(activeRow)}` : createLabel}</p>
                <p className="text-xs leading-5 text-muted-foreground">Saved through role-aware API routes with validation and exception handling.</p>
              </div>
              <Button type="button" variant="outline" size="icon" onClick={() => setMode("closed")} title="Close form">
                <X className="size-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {activeFields.map((field) => (
                <label key={field.key} className={cn("grid gap-1.5", field.span === "full" && "sm:col-span-2 xl:col-span-4", field.span === "half" && "xl:col-span-2")}>
                  <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
                  {field.type === "textarea" ? (
                    <Textarea value={form[field.key] ?? ""} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} placeholder={field.placeholder} required={field.required} />
                  ) : field.type === "select" ? (
                    <select value={form[field.key] ?? ""} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} required={field.required} className="form-select">
                      <option value="">Select {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input type={field.type || "text"} value={form[field.key] ?? ""} onChange={(event) => setForm({ ...form, [field.key]: event.target.value })} placeholder={field.placeholder} required={field.required} />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button disabled={loading} className="w-full sm:w-auto">
                {loading ? "Saving..." : mode === "edit" ? "Save changes" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setMode("closed")} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={cn("px-5 py-4 text-left", column.className)}>
                    {column.label}
                  </th>
                ))}
                {canUpdate || canDelete ? <th className="px-5 py-4 text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {filteredRows.length ? (
                filteredRows.map((row) => (
                  <tr key={row.id} className="border-t border-border/60 align-top">
                    {columns.map((column) => (
                      <td key={column.key} className={cn("px-5 py-4", column.className)}>
                        {cellContent(column, row)}
                      </td>
                    ))}
                    {canUpdate || canDelete ? (
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {canUpdate ? (
                            <Button size="sm" variant="outline" onClick={() => openEdit(row)} disabled={loading}>
                              <Edit3 className="size-3.5" />
                              Edit
                            </Button>
                          ) : null}
                          {canDelete ? (
                            <Button size="sm" variant="destructive" onClick={() => remove(row)} disabled={loading}>
                              <Trash2 className="size-3.5" />
                              {deleteLabel}
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-12">
                    <div className="empty-state">{query ? "No matching records found." : emptyState}</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
