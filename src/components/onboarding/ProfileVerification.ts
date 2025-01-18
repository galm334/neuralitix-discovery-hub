import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const verifyProfile = async (userId: string): Promise<boolean> => {
  let retries = MAX_RETRIES;

  while (retries > 0) {
    try {
      logger.info("Verifying profile", { userId, retriesLeft: retries });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        logger.error("Profile verification error", { error, userId, retriesLeft: retries });
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        return false;
      }
      
      if (data?.id) {
        logger.info("Profile verified successfully", { userId });
        return true;
      }

      logger.warn("Profile not found", { userId, retriesLeft: retries });
      retries--;
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    } catch (error) {
      logger.error("Profile verification error", { error, userId, retriesLeft: retries });
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  return false;
};

// Simple wrapper for backward compatibility
export const waitForProfileCreation = verifyProfile;