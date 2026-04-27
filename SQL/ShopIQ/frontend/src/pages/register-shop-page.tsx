import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/http";
import { useAuth, type CurrentUser } from "@/lib/auth-context";
import { FormInput } from "@/components/form-input";
import { TextareaField } from "@/components/textarea-field";

const schema = z.object({
  shopName: z.string().min(2),
  legalName: z.string().optional(),
  shopCode: z.string().min(2),
  shopEmail: z.string().email().optional().or(z.literal("")),
  shopPhoneNumber: z.string().min(6).optional().or(z.literal("")),
  address: z.string().optional(),
  adminFullName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPhoneNumber: z.string().min(6).optional().or(z.literal("")),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/)
});

type FormValues = z.infer<typeof schema>;

export function RegisterShopPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await api.post<CurrentUser>("/auth/register-shop", {
        ...values,
        shopEmail: values.shopEmail || null,
        shopPhoneNumber: values.shopPhoneNumber || null,
        adminPhoneNumber: values.adminPhoneNumber || null,
        legalName: values.legalName || null,
        address: values.address || null
      });
      setUser(user);
      toast.success("Shop created successfully.");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel panel auth-panel--wide">
        <div className="auth-panel__copy">
          <span className="eyebrow">Create your shop workspace</span>
          <h1>Set up ShopIQ in one secure step.</h1>
          <p>
            The shop and the first admin are created together. Your admin email becomes the
            unique login identity for this workspace.
          </p>
        </div>

        <form className="auth-form auth-form--grid" onSubmit={handleSubmit(onSubmit)}>
          <h2>Create Shop</h2>
          <FormInput label="Shop name" {...register("shopName")} error={errors.shopName?.message} />
          <FormInput label="Legal name" {...register("legalName")} error={errors.legalName?.message} />
          <FormInput label="Shop code" {...register("shopCode")} error={errors.shopCode?.message} />
          <FormInput label="Shop email" type="email" {...register("shopEmail")} error={errors.shopEmail?.message} />
          <FormInput label="Shop phone" {...register("shopPhoneNumber")} error={errors.shopPhoneNumber?.message} />
          <TextareaField label="Address" {...register("address")} error={errors.address?.message} />
          <FormInput label="Admin full name" {...register("adminFullName")} error={errors.adminFullName?.message} />
          <FormInput label="Admin email" type="email" {...register("adminEmail")} error={errors.adminEmail?.message} />
          <FormInput label="Admin phone" {...register("adminPhoneNumber")} error={errors.adminPhoneNumber?.message} />
          <FormInput label="Password" type="password" {...register("password")} error={errors.password?.message} />
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create ShopIQ workspace"}
          </button>
          <p className="auth-form__footnote">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
