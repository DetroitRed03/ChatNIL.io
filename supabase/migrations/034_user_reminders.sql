-- User Reminders table
-- Stores user-created reminders for tax payments, deal submissions, deadlines, etc.

CREATE TABLE IF NOT EXISTS public.user_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_date TIMESTAMPTZ NOT NULL,
    reminder_type TEXT NOT NULL DEFAULT 'custom' CHECK (reminder_type IN (
        'tax_payment', 'deal_submission', 'deadline', 'custom'
    )),
    related_deal_id UUID,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'completed', 'dismissed', 'expired'
    )),
    completed_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_reminders_user_status
    ON public.user_reminders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_reminders_date
    ON public.user_reminders(reminder_date);

-- RLS
ALTER TABLE public.user_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own reminders" ON public.user_reminders;
CREATE POLICY "Users view own reminders" ON public.user_reminders
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own reminders" ON public.user_reminders;
CREATE POLICY "Users insert own reminders" ON public.user_reminders
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own reminders" ON public.user_reminders;
CREATE POLICY "Users update own reminders" ON public.user_reminders
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own reminders" ON public.user_reminders;
CREATE POLICY "Users delete own reminders" ON public.user_reminders
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Updated at trigger (uses existing handle_updated_at function)
DROP TRIGGER IF EXISTS set_updated_at ON public.user_reminders;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_reminders
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_reminders TO authenticated;
