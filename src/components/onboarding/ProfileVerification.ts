import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export const verifyProfile = async (userId: string): Promise<boolean> => {
  try {
    logger.info("Starting profile verification", { userId });
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error) {
      logger.error("Profile verification error", { error, userId });
      return false;
    }
    
    return !!data;
  } catch (error) {
    logger.error("Profile verification failed", { error, userId });
    return false;
  }
};

export const waitForProfileCreation = async (userId: string): Promise<boolean> => {
  try {
    logger.info("Waiting for profile creation", { userId });
    
    // Try up to 3 times with a 2-second delay between attempts
    for (let i = 0; i < 3; i++) {
      const isVerified = await verifyProfile(userId);
      if (isVerified) {
        return true;
      }
      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return false;
  } catch (error) {
    logger.error("Profile creation verification failed", { error, userId });
    return false;
  }
};