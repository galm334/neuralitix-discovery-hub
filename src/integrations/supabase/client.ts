// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tlrrdakthzeytwpfygjn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRscnJkYWt0aHpleXR3cGZ5Z2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NzM2OTYsImV4cCI6MjA1MjQ0OTY5Nn0.pAkMQxCcqrD5T1T25NLCX6IgjWe0TxrrBEUqxw-ELaE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);