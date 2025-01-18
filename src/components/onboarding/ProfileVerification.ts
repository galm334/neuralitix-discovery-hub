import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export const verifyProfile = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      logger.error("Profile verification error", { error, userId });
      return false;
    }
    
    return !!data?.id;
  } catch (error) {
    logger.error("Profile verification error", { error, userId });
    return false;
  }
};

// Simple wrapper for backward compatibility
export const waitForProfileCreation = verifyProfile;