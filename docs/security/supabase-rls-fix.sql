-- InboxPilot Supabase RLS hardening
-- Run in Supabase SQL Editor as postgres/project owner.
-- This project uses its own public."User".id (cuid). For direct Supabase client access,
-- put that id in JWT claim `app_user_id`; for server-side app DB sessions, run:
--   select set_config('app.user_id', '<public.User.id>', true);

begin;

create schema if not exists app_private;

create or replace function app_private.current_user_id()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('app.user_id', true), ''),
    nullif(auth.jwt() ->> 'app_user_id', ''),
    nullif(auth.jwt() ->> 'sub', '')
  )
$$;

create or replace function app_private.is_workspace_member(target_workspace_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public."WorkspaceUser" wu
    where wu."workspaceId" = target_workspace_id
      and wu."userId" = app_private.current_user_id()
  )
$$;

create or replace function app_private.is_workspace_admin(target_workspace_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public."WorkspaceUser" wu
    where wu."workspaceId" = target_workspace_id
      and wu."userId" = app_private.current_user_id()
      and wu."role" = 'admin'
  )
$$;

create or replace function app_private.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public."User" u
    where u."id" = app_private.current_user_id()
      and u."role" = 'admin'
  )
$$;

create or replace function app_private.can_access_channel(target_channel_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public."Channel" c
    where c."id" = target_channel_id
      and c."workspaceId" is not null
      and app_private.is_workspace_member(c."workspaceId")
  )
$$;

create or replace function app_private.can_access_contact(target_contact_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public."Contact" ct
    join public."Channel" c on c."id" = ct."channelId"
    where ct."id" = target_contact_id
      and c."workspaceId" is not null
      and app_private.is_workspace_member(c."workspaceId")
  )
$$;

create or replace function app_private.can_access_conversation(target_conversation_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public."Conversation" cv
    join public."Channel" c on c."id" = cv."channelId"
    where cv."id" = target_conversation_id
      and c."workspaceId" is not null
      and app_private.is_workspace_member(c."workspaceId")
  )
$$;

create or replace function app_private.can_access_automation(target_automation_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public."Automation" a
    where a."id" = target_automation_id
      and a."workspaceId" is not null
      and app_private.is_workspace_member(a."workspaceId")
  )
$$;

create or replace function app_private.can_access_sequence(target_sequence_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public."Sequence" s
    where s."id" = target_sequence_id
      and app_private.is_workspace_member(s."workspaceId")
  )
$$;

create or replace function app_private.can_access_invoice(target_invoice_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public."Invoice" i
    where i."id" = target_invoice_id
      and (
        i."userId" = app_private.current_user_id()
        or app_private.is_workspace_member(i."workspaceId")
        or app_private.is_app_admin()
      )
  )
$$;

-- Enable RLS on every application table. System tables/schemas are not touched.
alter table public."User" enable row level security;
alter table public."Workspace" enable row level security;
alter table public."WorkspaceUser" enable row level security;
alter table public."WorkspaceAiSetting" enable row level security;
alter table public."WorkspaceAiCredential" enable row level security;
alter table public."AiModelCache" enable row level security;
alter table public."Channel" enable row level security;
alter table public."Contact" enable row level security;
alter table public."Conversation" enable row level security;
alter table public."Message" enable row level security;
alter table public."ContactFieldDefinition" enable row level security;
alter table public."ContactFieldValue" enable row level security;
alter table public."Tag" enable row level security;
alter table public."ContactTag" enable row level security;
alter table public."Segment" enable row level security;
alter table public."Automation" enable row level security;
alter table public."AutomationFolder" enable row level security;
alter table public."AutomationStep" enable row level security;
alter table public."AutomationRun" enable row level security;
alter table public."Broadcast" enable row level security;
alter table public."Job" enable row level security;
alter table public."Sequence" enable row level security;
alter table public."SequenceStep" enable row level security;
alter table public."SequenceSubscription" enable row level security;
alter table public."KnowledgeBaseItem" enable row level security;
alter table public."Subscription" enable row level security;
alter table public."PaymentOrder" enable row level security;
alter table public."SubscriptionAddon" enable row level security;
alter table public."WorkspaceUsageOverride" enable row level security;
alter table public."UsagePeriod" enable row level security;
alter table public."MessageEventLedger" enable row level security;
alter table public."ReferralCode" enable row level security;
alter table public."ReferralAttribution" enable row level security;
alter table public."ReferralReward" enable row level security;
alter table public."WalletLedger" enable row level security;
alter table public."AffiliateProfile" enable row level security;
alter table public."AffiliateCommission" enable row level security;
alter table public."Invoice" enable row level security;
alter table public."InvoiceItem" enable row level security;
alter table public."PayoutRequest" enable row level security;
alter table public."PayoutBatch" enable row level security;
alter table public."PayoutBatchItem" enable row level security;
alter table public."Coupon" enable row level security;

-- Drop old policies so this script is idempotent.
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'User','Workspace','WorkspaceUser','WorkspaceAiSetting','WorkspaceAiCredential','AiModelCache','Channel','Contact','Conversation','Message',
        'ContactFieldDefinition','ContactFieldValue','Tag','ContactTag','Segment','Automation','AutomationFolder','AutomationStep','AutomationRun','Broadcast','Job',
        'Sequence','SequenceStep','SequenceSubscription','KnowledgeBaseItem','Subscription','PaymentOrder','SubscriptionAddon','WorkspaceUsageOverride','UsagePeriod',
        'MessageEventLedger','ReferralCode','ReferralAttribution','ReferralReward','WalletLedger','AffiliateProfile','AffiliateCommission','Invoice','InvoiceItem',
        'PayoutRequest','PayoutBatch','PayoutBatchItem','Coupon'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- Sensitive identity table: no direct client access. Use API routes/views that omit passwordHash.
create policy "user_service_only" on public."User"
  for all using (false) with check (false);

-- Workspace and membership.
create policy "workspace_member_select" on public."Workspace"
  for select using (app_private.is_workspace_member("id"));
create policy "workspace_admin_update" on public."Workspace"
  for update using (app_private.is_workspace_admin("id")) with check (app_private.is_workspace_admin("id"));

create policy "workspace_user_member_select" on public."WorkspaceUser"
  for select using (app_private.is_workspace_member("workspaceId") or "userId" = app_private.current_user_id());
create policy "workspace_user_admin_write" on public."WorkspaceUser"
  for all using (app_private.is_workspace_admin("workspaceId")) with check (app_private.is_workspace_admin("workspaceId"));

-- Workspace-scoped configuration. Credentials intentionally service-only because encryptedApiKey is sensitive.
create policy "workspace_ai_setting_member_select" on public."WorkspaceAiSetting"
  for select using (app_private.is_workspace_member("workspaceId"));
create policy "workspace_ai_setting_admin_write" on public."WorkspaceAiSetting"
  for all using (app_private.is_workspace_admin("workspaceId")) with check (app_private.is_workspace_admin("workspaceId"));
create policy "workspace_ai_credential_service_only" on public."WorkspaceAiCredential"
  for all using (false) with check (false);

create policy "ai_model_cache_read_authenticated" on public."AiModelCache"
  for select using (app_private.current_user_id() is not null and "enabled" = true);

-- Workspace-owned operational tables.
create policy "channel_member_select" on public."Channel"
  for select using ("workspaceId" is not null and app_private.is_workspace_member("workspaceId"));
create policy "channel_admin_write" on public."Channel"
  for all using ("workspaceId" is not null and app_private.is_workspace_admin("workspaceId"))
  with check ("workspaceId" is not null and app_private.is_workspace_admin("workspaceId"));

create policy "contact_member_select" on public."Contact"
  for select using (app_private.can_access_channel("channelId"));
create policy "contact_member_write" on public."Contact"
  for all using (app_private.can_access_channel("channelId")) with check (app_private.can_access_channel("channelId"));

create policy "conversation_member_select" on public."Conversation"
  for select using (app_private.can_access_channel("channelId") and app_private.can_access_contact("contactId"));
create policy "conversation_member_write" on public."Conversation"
  for all using (app_private.can_access_channel("channelId") and app_private.can_access_contact("contactId"))
  with check (app_private.can_access_channel("channelId") and app_private.can_access_contact("contactId") and ("assignedToId" is null or "assignedToId" = app_private.current_user_id() or app_private.is_app_admin()));

create policy "message_member_select" on public."Message"
  for select using (app_private.can_access_channel("channelId") and app_private.can_access_contact("contactId") and app_private.can_access_conversation("conversationId"));
create policy "message_member_insert" on public."Message"
  for insert with check (app_private.can_access_channel("channelId") and app_private.can_access_contact("contactId") and app_private.can_access_conversation("conversationId"));

create policy "contact_field_definition_member_select" on public."ContactFieldDefinition"
  for select using (app_private.is_workspace_member("workspaceId"));
create policy "contact_field_definition_admin_write" on public."ContactFieldDefinition"
  for all using (app_private.is_workspace_admin("workspaceId")) with check (app_private.is_workspace_admin("workspaceId"));

create policy "contact_field_value_member_select" on public."ContactFieldValue"
  for select using (app_private.can_access_contact("contactId"));
create policy "contact_field_value_member_write" on public."ContactFieldValue"
  for all using (app_private.can_access_contact("contactId")) with check (app_private.can_access_contact("contactId"));

create policy "tag_member_select" on public."Tag"
  for select using ("workspaceId" is not null and app_private.is_workspace_member("workspaceId"));
create policy "tag_member_write" on public."Tag"
  for all using ("workspaceId" is not null and app_private.is_workspace_member("workspaceId"))
  with check ("workspaceId" is not null and app_private.is_workspace_member("workspaceId"));

create policy "contact_tag_member_select" on public."ContactTag"
  for select using (app_private.can_access_contact("contactId"));
create policy "contact_tag_member_write" on public."ContactTag"
  for all using (app_private.can_access_contact("contactId") and exists (
    select 1 from public."Tag" t where t."id" = public."ContactTag"."tagId" and t."workspaceId" is not null and app_private.is_workspace_member(t."workspaceId")
  )) with check (app_private.can_access_contact("contactId") and exists (
    select 1 from public."Tag" t where t."id" = public."ContactTag"."tagId" and t."workspaceId" is not null and app_private.is_workspace_member(t."workspaceId")
  ));

create policy "segment_member_select" on public."Segment"
  for select using (app_private.is_workspace_member("workspaceId"));
create policy "segment_member_write" on public."Segment"
  for all using (app_private.is_workspace_member("workspaceId")) with check (app_private.is_workspace_member("workspaceId"));

create policy "automation_member_select" on public."Automation"
  for select using ("workspaceId" is not null and app_private.is_workspace_member("workspaceId"));
create policy "automation_member_write" on public."Automation"
  for all using ("workspaceId" is not null and app_private.is_workspace_member("workspaceId"))
  with check ("workspaceId" is not null and app_private.is_workspace_member("workspaceId") and ("folderId" is null or exists (
    select 1 from public."AutomationFolder" f where f."id" = public."Automation"."folderId" and f."workspaceId" = public."Automation"."workspaceId"
  )));

create policy "automation_folder_member_select" on public."AutomationFolder"
  for select using (app_private.is_workspace_member("workspaceId"));
create policy "automation_folder_member_write" on public."AutomationFolder"
  for all using (app_private.is_workspace_member("workspaceId")) with check (app_private.is_workspace_member("workspaceId"));

create policy "automation_step_member_select" on public."AutomationStep"
  for select using (app_private.can_access_automation("automationId"));
create policy "automation_step_member_write" on public."AutomationStep"
  for all using (app_private.can_access_automation("automationId")) with check (app_private.can_access_automation("automationId"));

create policy "automation_run_member_select" on public."AutomationRun"
  for select using (app_private.can_access_automation("automationId") and app_private.can_access_contact("contactId") and app_private.can_access_conversation("conversationId"));
create policy "automation_run_member_write" on public."AutomationRun"
  for all using (app_private.can_access_automation("automationId") and app_private.can_access_contact("contactId") and app_private.can_access_conversation("conversationId"))
  with check (app_private.can_access_automation("automationId") and app_private.can_access_contact("contactId") and app_private.can_access_conversation("conversationId"));

create policy "broadcast_member_select" on public."Broadcast"
  for select using ("workspaceId" is not null and app_private.is_workspace_member("workspaceId"));
create policy "broadcast_member_write" on public."Broadcast"
  for all using ("workspaceId" is not null and app_private.is_workspace_member("workspaceId")) with check ("workspaceId" is not null and app_private.is_workspace_member("workspaceId"));

-- Jobs may contain provider payloads/errors. Keep client access closed.
create policy "job_service_only" on public."Job"
  for all using (false) with check (false);

create policy "sequence_member_select" on public."Sequence"
  for select using (app_private.is_workspace_member("workspaceId"));
create policy "sequence_member_write" on public."Sequence"
  for all using (app_private.is_workspace_member("workspaceId")) with check (app_private.is_workspace_member("workspaceId"));

create policy "sequence_step_member_select" on public."SequenceStep"
  for select using (app_private.can_access_sequence("sequenceId"));
create policy "sequence_step_member_write" on public."SequenceStep"
  for all using (app_private.can_access_sequence("sequenceId")) with check (app_private.can_access_sequence("sequenceId"));

create policy "sequence_subscription_member_select" on public."SequenceSubscription"
  for select using (app_private.can_access_sequence("sequenceId") and app_private.can_access_contact("contactId"));
create policy "sequence_subscription_member_write" on public."SequenceSubscription"
  for all using (app_private.can_access_sequence("sequenceId") and app_private.can_access_contact("contactId"))
  with check (app_private.can_access_sequence("sequenceId") and app_private.can_access_contact("contactId"));

create policy "knowledge_base_member_select" on public."KnowledgeBaseItem"
  for select using ("workspaceId" is not null and app_private.is_workspace_member("workspaceId"));
create policy "knowledge_base_member_write" on public."KnowledgeBaseItem"
  for all using ("workspaceId" is not null and app_private.is_workspace_member("workspaceId")) with check ("workspaceId" is not null and app_private.is_workspace_member("workspaceId"));

-- Billing/usage. Reads are workspace/user-scoped; writes should remain service-side.
create policy "subscription_member_select" on public."Subscription"
  for select using (app_private.is_workspace_member("workspaceId") or "userId" = app_private.current_user_id());
create policy "subscription_service_only_write" on public."Subscription"
  for insert with check (false);

create policy "payment_order_member_select" on public."PaymentOrder"
  for select using (app_private.is_workspace_member("workspaceId") or "userId" = app_private.current_user_id());
create policy "payment_order_service_only_write" on public."PaymentOrder"
  for insert with check (false);

create policy "subscription_addon_member_select" on public."SubscriptionAddon"
  for select using (app_private.is_workspace_member("workspaceId"));
create policy "subscription_addon_service_only_write" on public."SubscriptionAddon"
  for insert with check (false);

create policy "workspace_usage_override_admin_select" on public."WorkspaceUsageOverride"
  for select using (app_private.is_workspace_admin("workspaceId"));
create policy "workspace_usage_override_service_only_write" on public."WorkspaceUsageOverride"
  for insert with check (false);

create policy "usage_period_member_select" on public."UsagePeriod"
  for select using (app_private.is_workspace_member("workspaceId"));
create policy "usage_period_service_only_write" on public."UsagePeriod"
  for insert with check (false);

create policy "message_event_ledger_member_select" on public."MessageEventLedger"
  for select using (app_private.is_workspace_member("workspaceId"));
create policy "message_event_ledger_service_only_write" on public."MessageEventLedger"
  for insert with check (false);

-- Referral/affiliate/wallet: user-owned reads, app-admin reads where operationally needed. Writes service-side.
create policy "referral_code_owner_select" on public."ReferralCode"
  for select using ("userId" = app_private.current_user_id() or app_private.is_app_admin());
create policy "referral_code_owner_insert" on public."ReferralCode"
  for insert with check ("userId" = app_private.current_user_id());

create policy "referral_attribution_party_select" on public."ReferralAttribution"
  for select using ("referrerUserId" = app_private.current_user_id() or "referredUserId" = app_private.current_user_id() or app_private.is_app_admin());
create policy "referral_attribution_service_only_write" on public."ReferralAttribution"
  for insert with check (false);

create policy "referral_reward_party_select" on public."ReferralReward"
  for select using ("referrerUserId" = app_private.current_user_id() or "referredUserId" = app_private.current_user_id() or app_private.is_app_admin());
create policy "referral_reward_service_only_write" on public."ReferralReward"
  for insert with check (false);

create policy "wallet_ledger_owner_select" on public."WalletLedger"
  for select using ("userId" = app_private.current_user_id() or app_private.is_app_admin());
create policy "wallet_ledger_service_only_write" on public."WalletLedger"
  for insert with check (false);

create policy "affiliate_profile_owner_select" on public."AffiliateProfile"
  for select using ("userId" = app_private.current_user_id() or app_private.is_app_admin());
create policy "affiliate_profile_owner_upsert" on public."AffiliateProfile"
  for all using ("userId" = app_private.current_user_id() or app_private.is_app_admin())
  with check ("userId" = app_private.current_user_id() or app_private.is_app_admin());

create policy "affiliate_commission_owner_select" on public."AffiliateCommission"
  for select using ("affiliateUserId" = app_private.current_user_id() or "referredUserId" = app_private.current_user_id() or app_private.is_app_admin());
create policy "affiliate_commission_service_only_write" on public."AffiliateCommission"
  for insert with check (false);

create policy "invoice_owner_or_workspace_select" on public."Invoice"
  for select using ("userId" = app_private.current_user_id() or app_private.is_workspace_member("workspaceId") or app_private.is_app_admin());
create policy "invoice_service_only_write" on public."Invoice"
  for insert with check (false);

create policy "invoice_item_invoice_select" on public."InvoiceItem"
  for select using (app_private.can_access_invoice("invoiceId"));
create policy "invoice_item_service_only_write" on public."InvoiceItem"
  for insert with check (false);

create policy "payout_request_owner_select" on public."PayoutRequest"
  for select using ("affiliateUserId" = app_private.current_user_id() or app_private.is_app_admin());
create policy "payout_request_owner_insert" on public."PayoutRequest"
  for insert with check ("affiliateUserId" = app_private.current_user_id());

create policy "payout_batch_admin_select" on public."PayoutBatch"
  for select using (app_private.is_app_admin());
create policy "payout_batch_service_only_write" on public."PayoutBatch"
  for insert with check (false);

create policy "payout_batch_item_owner_select" on public."PayoutBatchItem"
  for select using ("affiliateUserId" = app_private.current_user_id() or app_private.is_app_admin());
create policy "payout_batch_item_service_only_write" on public."PayoutBatchItem"
  for insert with check (false);

create policy "coupon_member_select" on public."Coupon"
  for select using (("workspaceId" is null and "status" = 'active') or ("workspaceId" is not null and app_private.is_workspace_member("workspaceId")) or app_private.is_app_admin());
create policy "coupon_admin_write" on public."Coupon"
  for all using (app_private.is_app_admin()) with check (app_private.is_app_admin());

-- Privilege hygiene. Keep anonymous users out; authenticated users can only do what RLS permits.
revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

commit;

-- Audit after running:
-- 1) Tables with RLS still off
-- select schemaname, tablename from pg_tables where schemaname = 'public' and rowsecurity = false order by tablename;
-- 2) Tables without policies
-- select c.relname as table_name from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity and not exists (select 1 from pg_policy p where p.polrelid=c.oid) order by 1;
-- 3) Existing permissive policies
-- select schemaname, tablename, policyname, cmd, qual, with_check from pg_policies where schemaname='public' order by tablename, policyname;
