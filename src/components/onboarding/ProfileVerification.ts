import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export const verifyProfile = async (userId: string): Promise<boolean> => {
  try {
    logger.info("Starting profile verification for user:", userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, name, terms_accepted')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      logger.error("Profile verification error:", error);
      return false;
    }
    
    const isValid = !!data && !!data.nickname && !!data.name && data.terms_accepted === true;
    logger.info("Profile verification result:", { data, isValid });
    return isValid;
  } catch (error) {
    logger.error("Profile verification failed:", error);
    return false;
  }
};

export const waitForProfileCreation = async (
  userId: string,
  maxAttempts: number = 10,
  delayBetweenAttempts: number = 5000, // 5 seconds
  maxWaitTime: number = 60000 // 60 seconds
): Promise<boolean> => {
  const startTime = Date.now();
  let attempts = 0;
  
  while (Date.now() - startTime < maxWaitTime && attempts < maxAttempts) {
    attempts++;
    logger.info(`Verification attempt ${attempts}/${maxAttempts}`);
    
    const profileCreated = await verifyProfile(userId);
    if (profileCreated) {
      logger.info("Profile verified successfully");
      return true;
    }
    
    if (attempts < maxAttempts) {
      logger.info(`Profile not verified yet, waiting ${delayBetweenAttempts}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
    }
  }
  
  logger.error(`Profile creation verification timeout after ${attempts} attempts and ${Date.now() - startTime}ms`);
  return false;
};