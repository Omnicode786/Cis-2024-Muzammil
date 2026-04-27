import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/http";
import { useAuth, type CurrentUser } from "@/lib/auth-context";
import { FormInput } from "@/components/form-input";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await api.post<CurrentUser>("/auth/login", values);
      setUser(user);
      toast.success("Welcome back.");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel panel">
        <div className="auth-panel__copy">
          <span className="eyebrow">Secure retail operations</span>
          <h1>Run your shop with speed, clarity, and style.</h1>
          <p>
            ShopIQ gives each shop its own secure workspace, its own team, receivables,
            payables, reports, and an AI assistant.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <h2>Sign in</h2>
          <FormInput label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <FormInput label="Password" type="password" {...register("password")} error={errors.password?.message} />
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
          <p className="auth-form__footnote">
            Need a shop? <Link to="/register">Create ShopIQ workspace</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
