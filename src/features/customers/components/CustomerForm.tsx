import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Customer } from "@/types/database.types";
import type { CustomerFormData } from "../services/customer.service";

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().min(1, "Telepon wajib diisi"),
  email: z.string().optional(),
  birthday: z.string().optional(),
});

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSubmit: (data: CustomerFormData) => Promise<void>;
}

export function CustomerForm({
  open,
  onOpenChange,
  customer,
  onSubmit,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "", birthday: "" },
  });

  useEffect(() => {
    if (open) {
      if (customer) {
        reset({
          name: customer.name,
          phone: customer.phone,
          email: customer.email ?? "",
          birthday: customer.birthday ?? "",
        });
      } else {
        reset({ name: "", phone: "", email: "", birthday: "" });
      }
    }
  }, [open, customer, reset]);

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    await onSubmit(data as unknown as CustomerFormData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Pelanggan" : "Tambah Pelanggan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" placeholder="Nama pelanggan" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input id="phone" placeholder="08xxxxxxxxxx" {...register("phone")} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (opsional)</Label>
            <Input id="email" type="email" placeholder="email@contoh.com" {...register("email")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthday">Tanggal Lahir (opsional)</Label>
            <Input id="birthday" type="date" {...register("birthday")} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
