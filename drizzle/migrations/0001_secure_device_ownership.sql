CREATE OR REPLACE FUNCTION public.prevent_owner_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id <> OLD.owner_id THEN
    RAISE EXCEPTION 'owner_id cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER devices_prevent_owner_change BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_change();
CREATE TRIGGER commands_prevent_owner_change BEFORE UPDATE ON public.device_commands FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_change();
CREATE TRIGGER telemetry_prevent_owner_change BEFORE UPDATE ON public.device_telemetry FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_change();
CREATE TRIGGER consent_events_prevent_owner_change BEFORE UPDATE ON public.command_consent_events FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_change();

CREATE OR REPLACE FUNCTION public.prevent_command_identity_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.device_id <> OLD.device_id OR NEW.command_type <> OLD.command_type THEN
    RAISE EXCEPTION 'command identity cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER commands_prevent_identity_change BEFORE UPDATE ON public.device_commands FOR EACH ROW EXECUTE FUNCTION public.prevent_command_identity_change();

DROP POLICY "Owners update own commands" ON public.device_commands;
CREATE POLICY "Owners update own commands" ON public.device_commands FOR UPDATE TO authenticated USING (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.owner_id = auth.uid())) WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.owner_id = auth.uid()));

DROP POLICY "Owners update own telemetry" ON public.device_telemetry;
CREATE POLICY "Owners update own telemetry" ON public.device_telemetry FOR UPDATE TO authenticated USING (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.owner_id = auth.uid())) WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.owner_id = auth.uid()));

DROP POLICY "Owners delete own telemetry" ON public.device_telemetry;
CREATE POLICY "Owners delete own telemetry" ON public.device_telemetry FOR DELETE TO authenticated USING (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.owner_id = auth.uid()));