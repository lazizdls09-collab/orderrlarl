CREATE TABLE public.salary_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_salary_payments_employee ON public.salary_payments (employee_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.salary_payments TO authenticated;
GRANT ALL ON public.salary_payments TO service_role;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "salary_payments staff read" ON public.salary_payments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "salary_payments manage" ON public.salary_payments FOR ALL TO authenticated
  USING (public.can_manage(auth.uid())) WITH CHECK (public.can_manage(auth.uid()));

CREATE TABLE public.day_closings (
  day DATE PRIMARY KEY,
  revenue NUMERIC(14,2) NOT NULL DEFAULT 0,
  cost NUMERIC(14,2) NOT NULL DEFAULT 0,
  expenses NUMERIC(14,2) NOT NULL DEFAULT 0,
  salary NUMERIC(14,2) NOT NULL DEFAULT 0,
  profit NUMERIC(14,2) NOT NULL DEFAULT 0,
  orders_count INT NOT NULL DEFAULT 0,
  closed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.day_closings TO authenticated;
GRANT ALL ON public.day_closings TO service_role;
ALTER TABLE public.day_closings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "day_closings staff read" ON public.day_closings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "day_closings manage" ON public.day_closings FOR ALL TO authenticated
  USING (public.can_manage(auth.uid())) WITH CHECK (public.can_manage(auth.uid()));

CREATE TABLE public.month_closings (
  month TEXT PRIMARY KEY,
  revenue NUMERIC(14,2) NOT NULL DEFAULT 0,
  cost NUMERIC(14,2) NOT NULL DEFAULT 0,
  expenses NUMERIC(14,2) NOT NULL DEFAULT 0,
  salary NUMERIC(14,2) NOT NULL DEFAULT 0,
  profit NUMERIC(14,2) NOT NULL DEFAULT 0,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  closed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT month_closings_format CHECK (month ~ '^[0-9]{4}-[0-9]{2}$')
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.month_closings TO authenticated;
GRANT ALL ON public.month_closings TO service_role;
ALTER TABLE public.month_closings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "month_closings staff read" ON public.month_closings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "month_closings manage" ON public.month_closings FOR ALL TO authenticated
  USING (public.can_manage(auth.uid())) WITH CHECK (public.can_manage(auth.uid()));
