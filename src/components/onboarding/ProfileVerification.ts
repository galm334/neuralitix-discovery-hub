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
    
    logger.info("Profile verification result:", data);
    return !!data && !!data.nickname && !!data.name && data.terms_accepted === true;
  } catch (error) {
    logger.error("Profile verification failed:", error);
    return false;
  }
};

export const waitForProfileCreation = async (
  userId: string,
  maxAttempts: number = 10, // Increased from 5
  delayBetweenAttempts: number = 5000, // Increased to 5 seconds
  maxWaitTime: number = 60000 // Increased to 60 seconds
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
    
    logger.info(`Profile not verified yet, waiting ${delayBetweenAttempts}ms before retry...`);
    await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
  }
  
  logger.error("Profile creation verification timeout");
  return false;
};