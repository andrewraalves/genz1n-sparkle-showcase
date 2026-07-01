
alter function public.has_role(uuid, public.app_role) set search_path = public;
alter function public.handle_new_user() set search_path = public;
alter function public.set_updated_at() set search_path = public;

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- Tighten permissive insert policies with basic length checks
drop policy "Anyone can apply" on public.job_applications;
create policy "Anyone can apply" on public.job_applications for insert to anon, authenticated
  with check (length(full_name) between 1 and 200 and length(email) between 3 and 200 and coalesce(length(message), 0) <= 5000);

drop policy "Anyone can send" on public.contact_messages;
create policy "Anyone can send" on public.contact_messages for insert to anon, authenticated
  with check (length(name) between 1 and 200 and length(email) between 3 and 200 and length(message) between 1 and 5000);
