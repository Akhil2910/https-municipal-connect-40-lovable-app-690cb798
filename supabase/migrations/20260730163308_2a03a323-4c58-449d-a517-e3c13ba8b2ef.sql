REVOKE EXECUTE ON FUNCTION public.can_manage_ulb(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.can_manage_ulb(uuid) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;