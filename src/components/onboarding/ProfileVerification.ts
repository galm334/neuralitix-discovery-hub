import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export const verifyProfile = async (userId: string): Promise<boolean> => {
  try {
    logger.info("Verifying profile creation", { userId });
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error) {
      logger.error("Profile verification failed", { error, userId });
      return false;
    }
    
    return !!data;
  } catch (error) {
    logger.error("Profile verification error", { error, userId });
    return false;
  }
};

// Simple wrapper for backward compatibility
export const waitForProfileCreation = verifyProfile;