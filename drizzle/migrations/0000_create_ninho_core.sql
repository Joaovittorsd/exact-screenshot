CREATE TYPE public.device_platform AS ENUM ('android', 'ios', 'other');
CREATE TYPE public.device_connection_status AS ENUM ('offline', 'online');
CREATE TYPE public.device_command_type AS ENUM ('get_location', 'capture_photo', 'capture_screenshot', 'record_screen', 'record_audio', 'send_message', 'play_alert');
CREATE TYPE public.device_command_status AS ENUM ('pending', 'processing', 'completed', 'denied', 'failed');
CREATE TYPE public.telemetry_type AS ENUM ('location', 'photo', 'screenshot', 'screen_recording', 'audio_recording', 'device_status');
CREATE TYPE public.consent_status AS ENUM ('not_required', 'pending', 'granted', 'denied', 'expired');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT '',
  phone text,
  avatar_path text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Owners create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Owners update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Owners delete own profile" ON public.profiles FOR DELETE TO authenticated USING (id = auth.uid());

CREATE TABLE public.devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  child_name text NOT NULL,
  platform public.device_platform NOT NULL DEFAULT 'android',
  connection_status public.device_connection_status NOT NULL DEFAULT 'offline',
  battery_level smallint,
  pairing_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  paired_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT devices_battery_range CHECK (battery_level IS NULL OR battery_level BETWEEN 0 AND 100)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.devices TO authenticated;
GRANT ALL ON public.devices TO service_role;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own devices" ON public.devices FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners create own devices" ON public.devices FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update own devices" ON public.devices FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners delete own devices" ON public.devices FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX devices_owner_idx ON public.devices(owner_id);

CREATE TABLE public.device_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  command_type public.device_command_type NOT NULL,
  status public.device_command_status NOT NULL DEFAULT 'pending',
  consent_status public.consent_status NOT NULL DEFAULT 'pending',
  parameters jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_commands TO authenticated;
GRANT ALL ON public.device_commands TO service_role;
ALTER TABLE public.device_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own commands" ON public.device_commands FOR SELECT TO authenticated USING (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.owner_id = auth.uid()));
CREATE POLICY "Owners create commands" ON public.device_commands FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.owner_id = auth.uid()));
CREATE POLICY "Owners update own commands" ON public.device_commands FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners delete own commands" ON public.device_commands FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX device_commands_device_status_idx ON public.device_commands(device_id, status, created_at DESC);

CREATE TABLE public.device_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  command_id uuid REFERENCES public.device_commands(id) ON DELETE SET NULL,
  telemetry_type public.telemetry_type NOT NULL,
  payload_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_telemetry TO authenticated;
GRANT ALL ON public.device_telemetry TO service_role;
ALTER TABLE public.device_telemetry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own telemetry" ON public.device_telemetry FOR SELECT TO authenticated USING (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.owner_id = auth.uid()));
CREATE POLICY "Owners create own telemetry" ON public.device_telemetry FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.owner_id = auth.uid()));
CREATE POLICY "Owners update own telemetry" ON public.device_telemetry FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners delete own telemetry" ON public.device_telemetry FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX device_telemetry_device_created_idx ON public.device_telemetry(device_id, created_at DESC);

CREATE TABLE public.command_consent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  command_id uuid NOT NULL REFERENCES public.device_commands(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  status public.consent_status NOT NULL,
  actor text NOT NULL DEFAULT 'supervised_device',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.command_consent_events TO authenticated;
GRANT ALL ON public.command_consent_events TO service_role;
ALTER TABLE public.command_consent_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own consent audit" ON public.command_consent_events FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners create own consent audit" ON public.command_consent_events FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.devices d WHERE d.id = device_id AND d.owner_id = auth.uid()));
CREATE POLICY "Owners update own consent audit" ON public.command_consent_events FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners delete own consent audit" ON public.command_consent_events FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX consent_events_command_idx ON public.command_consent_events(command_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER devices_set_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Owners read device media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'device-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners upload device media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'device-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners update device media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'device-media' AND (storage.foldername(name))[1] = auth.uid()::text) WITH CHECK (bucket_id = 'device-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners delete device media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'device-media' AND (storage.foldername(name))[1] = auth.uid()::text);

ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.device_commands;
ALTER PUBLICATION supabase_realtime ADD TABLE public.device_telemetry;
ALTER PUBLICATION supabase_realtime ADD TABLE public.command_consent_events;